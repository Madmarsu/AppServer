/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
 *
 * This program is freeware. You can redistribute it and/or modify it under the terms of the GNU 
 * General Public License (GPL) version 3 as published by the Free Software Foundation (https://www.gnu.org/copyleft/gpl.html). 
 * In accordance with Section 7(a) of the GNU GPL its Section 15 shall be amended to the effect that 
 * Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * THIS PROGRAM IS DISTRIBUTED WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR
 * FITNESS FOR A PARTICULAR PURPOSE. For more details, see GNU GPL at https://www.gnu.org/copyleft/gpl.html
 *
 * You can contact Ascensio System SIA by email at sales@onlyoffice.com
 *
 * The interactive user interfaces in modified source and object code versions of ONLYOFFICE must display 
 * Appropriate Legal Notices, as required under Section 5 of the GNU GPL version 3.
 *
 * Pursuant to Section 7 § 3(b) of the GNU GPL you must retain the original ONLYOFFICE logo which contains 
 * relevant author attributions when distributing the software. If the display of the logo in its graphic 
 * form is not reasonably feasible for technical reasons, you must include the words "Powered by ONLYOFFICE" 
 * in every copy of the program you distribute. 
 * Pursuant to Section 7 § 3(e) we decline to grant you any rights under trademark law for use of our trademarks.
 *
*/


using System;
using System.Collections.Generic;
using ASC.Common.Logging;
//using System.Web;
using ASC.Common.Threading.Progress;
using ASC.Core;
using ASC.Core.Users;
using ASC.MessagingSystem;
//using ASC.Web.CRM.Core;
using ASC.Web.Core.Users;
//using ASC.Web.Files.Services.WCFService;
//using ASC.Web.Projects.Core.Engine;
using ASC.Web.Studio.Core.Notify;
//using Autofac;
//using CrmDaoFactory = ASC.CRM.Core.Dao.DaoFactory;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;

namespace ASC.Data.Reassigns
{
    public class ReassignProgressItem : IProgressItem
    {
        private readonly HttpContext _context;
        private readonly Dictionary<string, string> _httpHeaders;

        private readonly int _tenantId;
        private readonly Guid _currentUserId;
        private readonly bool _deleteProfile;

        //private readonly IFileStorageService _docService;
        //private readonly ProjectsReassign _projectsReassign;

        public object Id { get; set; }
        public object Status { get; set; }
        public object Error { get; set; }
        public double Percentage { get; set; }
        public bool IsCompleted { get; set; }
        public Guid FromUser { get; }
        public Guid ToUser { get; }
        public IServiceProvider ServiceProvider { get; }
        public QueueWorkerRemove QueueWorkerRemove { get; }

        public ReassignProgressItem(
            IServiceProvider serviceProvider,
            HttpContext context,
            QueueWorkerReassign queueWorkerReassign,
            QueueWorkerRemove queueWorkerRemove,
            int tenantId, Guid fromUserId, Guid toUserId, Guid currentUserId, bool deleteProfile)
        {
            ServiceProvider = serviceProvider;
            _context = context;
            QueueWorkerRemove = queueWorkerRemove;
            _httpHeaders = QueueWorker.GetHttpHeaders(context.Request);

            _tenantId = tenantId;
            FromUser = fromUserId;
            ToUser = toUserId;
            _currentUserId = currentUserId;
            _deleteProfile = deleteProfile;

            //_docService = Web.Files.Classes.Global.FileStorageService;
            //_projectsReassign = new ProjectsReassign();

            Id = queueWorkerReassign.GetProgressItemId(tenantId, fromUserId);
            Status = ProgressStatus.Queued;
            Error = null;
            Percentage = 0;
            IsCompleted = false;
        }

        public void RunJob()
        {
            var logger = ServiceProvider.GetService<IOptionsMonitor<ILog>>().Get("ASC.Web");

            using var scope = ServiceProvider.CreateScope();
            var tenantManager = scope.ServiceProvider.GetService<TenantManager>();
            var tenant = tenantManager.SetCurrentTenant(_tenantId);

            var coreSettings = scope.ServiceProvider.GetService<CoreBaseSettings>();
            var messageService = scope.ServiceProvider.GetService<MessageService>();
            var studioNotifyService = scope.ServiceProvider.GetService<StudioNotifyService>();
            var securityContext = scope.ServiceProvider.GetService<SecurityContext>();
            var userManager = scope.ServiceProvider.GetService<UserManager>();
            var userPhotoManager = scope.ServiceProvider.GetService<UserPhotoManager>();
            var displayUserSettingsHelper = scope.ServiceProvider.GetService<DisplayUserSettingsHelper>();
            var messageTarget = scope.ServiceProvider.GetService<MessageTarget>();

            try
            {
                Percentage = 0;
                Status = ProgressStatus.Started;

                securityContext.AuthenticateMe(_currentUserId);

                logger.InfoFormat("reassignment of data from {0} to {1}", FromUser, ToUser);

                logger.Info("reassignment of data from documents");

                Percentage = 33;
                //_docService.ReassignStorage(_fromUserId, _toUserId);

                logger.Info("reassignment of data from projects");

                Percentage = 66;
                //_projectsReassign.Reassign(_fromUserId, _toUserId);

                if (!coreSettings.CustomMode)
                {
                    logger.Info("reassignment of data from crm");

                    Percentage = 99;
                    //using (var scope = DIHelper.Resolve(_tenantId))
                    //{
                    //    var crmDaoFactory = scope.Resolve<CrmDaoFactory>();
                    //    crmDaoFactory.ContactDao.ReassignContactsResponsible(_fromUserId, _toUserId);
                    //    crmDaoFactory.DealDao.ReassignDealsResponsible(_fromUserId, _toUserId);
                    //    crmDaoFactory.TaskDao.ReassignTasksResponsible(_fromUserId, _toUserId);
                    //    crmDaoFactory.CasesDao.ReassignCasesResponsible(_fromUserId, _toUserId);
                    //}
                }

                SendSuccessNotify(userManager, studioNotifyService, messageService, messageTarget, displayUserSettingsHelper);

                Percentage = 100;
                Status = ProgressStatus.Done;

                if (_deleteProfile)
                {
                    DeleteUserProfile(userManager, userPhotoManager, messageService, messageTarget, displayUserSettingsHelper);
                }
            }
            catch (Exception ex)
            {
                logger.Error(ex);
                Status = ProgressStatus.Failed;
                Error = ex.Message;
                SendErrorNotify(userManager, studioNotifyService, ex.Message);
            }
            finally
            {
                logger.Info("data reassignment is complete");
                IsCompleted = true;
            }
        }

        public object Clone()
        {
            return MemberwiseClone();
        }

        private void SendSuccessNotify(UserManager userManager, StudioNotifyService studioNotifyService, MessageService messageService, MessageTarget messageTarget, DisplayUserSettingsHelper displayUserSettingsHelper)
        {
            var fromUser = userManager.GetUsers(FromUser);
            var toUser = userManager.GetUsers(ToUser);

            studioNotifyService.SendMsgReassignsCompleted(_currentUserId, fromUser, toUser);

            var fromUserName = fromUser.DisplayUserName(false, displayUserSettingsHelper);
            var toUserName = toUser.DisplayUserName(false, displayUserSettingsHelper);

            if (_httpHeaders != null)
                messageService.Send(_httpHeaders, MessageAction.UserDataReassigns, messageTarget.Create(FromUser), new[] { fromUserName, toUserName });
            else
                messageService.Send(MessageAction.UserDataReassigns, messageTarget.Create(FromUser), fromUserName, toUserName);
        }

        private void SendErrorNotify(UserManager userManager, StudioNotifyService studioNotifyService, string errorMessage)
        {
            var fromUser = userManager.GetUsers(FromUser);
            var toUser = userManager.GetUsers(ToUser);

            studioNotifyService.SendMsgReassignsFailed(_currentUserId, fromUser, toUser, errorMessage);
        }

        private void DeleteUserProfile(UserManager userManager, UserPhotoManager userPhotoManager, MessageService messageService, MessageTarget messageTarget, DisplayUserSettingsHelper displayUserSettingsHelper)
        {
            var user = userManager.GetUsers(FromUser);
            var userName = user.DisplayUserName(false, displayUserSettingsHelper);

            userPhotoManager.RemovePhoto(user.ID);
            userManager.DeleteUser(user.ID);
            QueueWorkerRemove.Start(_tenantId, user, _currentUserId, false);

            if (_httpHeaders != null)
                messageService.Send(_httpHeaders, MessageAction.UserDeleted, messageTarget.Create(FromUser), new[] { userName });
            else
                messageService.Send(MessageAction.UserDeleted, messageTarget.Create(FromUser), userName);
        }
    }

    public static class ReassignProgressItemExtension
    {
        public static IServiceCollection AddReassignProgressItemService(this IServiceCollection services)
        {
            services.TryAddSingleton<ProgressQueueOptionsManager<ReassignProgressItem>>();
            services.TryAddSingleton<ProgressQueue<ReassignProgressItem>>();
            services.AddSingleton<IConfigureOptions<ProgressQueue<ReassignProgressItem>>, ConfigureProgressQueue<ReassignProgressItem>>(); ;
            return services;
        }
    }
}
