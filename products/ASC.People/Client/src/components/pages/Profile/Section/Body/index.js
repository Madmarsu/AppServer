import React, { useCallback } from 'react';
import { withRouter } from 'react-router';
import { Text, Avatar, Button, ToggleContent, IconButton, Link } from 'asc-web-components';
import { connect } from 'react-redux';
import { getUserRole, getContacts } from '../../../../../store/people/selectors';

const profileWrapper = {
  display: "flex",
  alignItems: "flex-start",
  flexDirection: "row",
  flexWrap: "wrap"
};

const avatarWrapper = {
  marginRight: "32px",
  marginBottom: "24px"
};

const editButtonWrapper = {
  marginTop: "16px",
  width: "160px"
};

const infoWrapper = {
  display: "inline-flex",
  marginBottom: "24px"
};

const textTruncate = {
  padding: "0 8px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const titlesWrapper = {
  marginRight: "8px"
};

const restMargins = {
  marginBottom: "0",
  marginBlockStart: "5px",
  marginBlockEnd: "0px",
};

const notesWrapper = {
  display: "block",
  marginTop: "24px",
  width: "100%"
};

/*
const marginTop24 = {
  marginTop: "24px"
};

const marginTop22 = {
  marginTop: "22px"
};

const marginTop10 = {
  marginTop: "10px"
};

const marginLeft18 = {
  marginLeft: "18px"
};
*/

const selfToggleWrapper = {
  width: "100%",
  marginBottom: "24px"
}

const contactsToggleWrapper = {
  width: "100%",
  marginTop: "24px"
};

const notesToggleWrapper = {
  width: "100%"
};

const contactWrapper = {
  display: "inline-flex",
  width: "300px"
};

const getFormattedDate = (date) => {
  if (!date) return;
  let d = date.slice(0, 10).split('-');
  return d[1] + '.' + d[2] + '.' + d[0];
};

const getFormattedDepartments = (departments) => {
  const splittedDepartments = departments.split(',');
  const departmentsLength = splittedDepartments.length - 1;
  const formattedDepartments = splittedDepartments.map((department, index) => {
    return (
      <span key={index}>
        <Link type="action" fontSize={13} isHovered={true} >
          {department.trim()}
        </Link>
        {(departmentsLength !== index) ? ', ' : ''}
      </span>
    )
  });

  return formattedDepartments;
};

const capitalizeFirstLetter = (string) => {
  if (!string) return;
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const createContacts = (contacts) => {
  return contacts.map((contact, index) => {
    return (
      <div key={index} style={contactWrapper}>
        <IconButton color="#333333" size={16} iconName={contact.icon} isFill={true} />
        <div style={textTruncate}>{contact.value}</div>
      </div>
    );
  });
};

const SectionBodyContent = (props) => {
  const { profile, history, isSelf, settings } = props;
  //console.log(profile, settings);
  const contacts = profile.contacts && getContacts(profile.contacts);
  const role = getUserRole(profile);
  const workFrom = getFormattedDate(profile.workFrom);
  const birthDay = getFormattedDate(profile.birthday);
  const formatedSex = capitalizeFirstLetter(profile.sex);
  const formatedDepartments = getFormattedDepartments(profile.department);
  const socialContacts = contacts && createContacts(contacts.social);
  const infoContacts = contacts && createContacts(contacts.contact);

  const onEmailClick = useCallback(
    () => window.open('mailto:' + profile.email),
    [profile.email]
  );

  const onEditSubscriptionsClick = useCallback(
    () => console.log('Edit subscriptions onClick()'),
    []
  );

  /*
  const onBecomeAffiliateClick = useCallback(
    () => console.log('Become our Affiliate onClick()'),
    []
  );
  */

  const onEditProfileClick = useCallback(
    () => history.push(`${settings.homepage}/edit/${profile.userName}`),
    [history, settings.homepage, profile.userName]
  );

  return (
    <div style={profileWrapper}>
      <div style={avatarWrapper}>
        <Avatar size="max" role={role} source={profile.avatarMax} userName={profile.displayName} />
        <Button style={editButtonWrapper} size="big" label="Edit profile" onClick={onEditProfileClick} />
      </div>
      <div style={infoWrapper}>
        <div style={titlesWrapper}>
          <Text.Body style={restMargins} color='#A3A9AE' title='Type'>Type:</Text.Body>
          {profile.email && <Text.Body style={restMargins} color='#A3A9AE' title='E-mail'>E-mail:</Text.Body>}
          {profile.department && <Text.Body style={restMargins} color='#A3A9AE' title='Department'>Department:</Text.Body>}
          {profile.title && <Text.Body style={restMargins} color='#A3A9AE' title='Position'>Position:</Text.Body>}
          {profile.mobilePhone && <Text.Body style={restMargins} color='#A3A9AE' title='Phone'>Phone:</Text.Body>}
          {profile.sex && <Text.Body style={restMargins} color='#A3A9AE' title='Sex'>Sex:</Text.Body>}
          {profile.workFrom && <Text.Body style={restMargins} color='#A3A9AE' title='Employed since'>Employed since:</Text.Body>}
          {profile.birthday && <Text.Body style={restMargins} color='#A3A9AE' title='Date of birth'>Date of birth:</Text.Body>}
          {profile.location && <Text.Body style={restMargins} color='#A3A9AE' title='Location'>Location:</Text.Body>}
          {isSelf && <Text.Body style={restMargins} color='#A3A9AE' title='Language'>Language:</Text.Body>}
          {/*{isSelf && <Text.Body style={marginTop24} color='#A3A9AE' title='Affiliate status'>Affiliate status:</Text.Body>}*/}
        </div> 
        <div>
          <Text.Body style={restMargins}>{profile.isVisitor ? "Guest" : "Employee"}</Text.Body>
          <Text.Body style={restMargins}>
            <Link type="page" fontSize={13} isHovered={true} onClick={onEmailClick} >
              {profile.email}
            </Link>
            {profile.activationStatus === 2 && ' (Pending)'}
          </Text.Body>
          <Text.Body style={restMargins}>{formatedDepartments}</Text.Body>
          <Text.Body style={restMargins}>{profile.title}</Text.Body>
          <Text.Body style={restMargins}>{profile.mobilePhone}</Text.Body>
          <Text.Body style={restMargins}>{formatedSex}</Text.Body>
          <Text.Body style={restMargins}>{workFrom}</Text.Body>
          <Text.Body style={restMargins}>{birthDay}</Text.Body>
          <Text.Body style={restMargins}>{profile.location}</Text.Body>
          {isSelf && <Text.Body style={restMargins}>{profile.cultureName || settings.currentCulture}</Text.Body>}
          {/*{isSelf && <Button style={marginTop22} size="base" label="Become our Affiliate" onClick={onBecomeAffiliateClick} />}*/}
        </div>
      </div>
      {/*{isSelf &&
        <div style={selfToggleWrapper}>
          <ToggleContent label="Login settings" style={notesWrapper} isOpen={true}>
            <Text.Body as="span">
              Two-factor authentication via code generating application was enabled for all users by cloud service administrator.
              <div style={marginTop10}>
                <Link type="action" isBold={true} isHovered={true} fontSize={13} >{'Reset application'}</Link>
                <Link style={marginLeft18} type="action" isBold={true} isHovered={true} fontSize={13} >{'Show backup codes'}</Link>
              </div>
            </Text.Body>
          </ToggleContent>
        </div>
      }*/}
      {isSelf &&
        <div style={selfToggleWrapper}>
          <ToggleContent label="Subscriptions" style={notesWrapper} isOpen={true}>
            <Text.Body as="span">
              <Button size="big" label="Edit subscriptions" primary={true} onClick={onEditSubscriptionsClick} />
            </Text.Body>
          </ToggleContent>
        </div>
      }
      {profile.notes &&
        <div style={notesToggleWrapper}>
          <ToggleContent label="Comment" style={notesWrapper} isOpen={true}>
            <Text.Body as="span">
              {profile.notes}
            </Text.Body>
          </ToggleContent>
        </div>
      }
      {profile.contacts &&
        <div style={contactsToggleWrapper}>
          <ToggleContent label="Contact information" style={notesWrapper} isOpen={true}>
            <Text.Body as="span">
              {infoContacts}
            </Text.Body>
          </ToggleContent>
        </div>
      }
      {profile.contacts &&
        <div style={contactsToggleWrapper}>
          <ToggleContent label="Social profiles" style={notesWrapper} isOpen={true}>
            <Text.Body as="span">
              {socialContacts}
            </Text.Body>
          </ToggleContent>
        </div>
      }
    </div>
  );
};

function mapStateToProps(state) {
  return {
    settings: state.settings
  };
}

export default connect(mapStateToProps)(withRouter(SectionBodyContent));