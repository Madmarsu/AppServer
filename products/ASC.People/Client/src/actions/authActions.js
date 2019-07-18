import * as api from '../utils/api';
import { SET_CURRENT_USER, SET_MODULES, SET_IS_LOADED, LOGOUT } from './actionTypes';
import { setGroups, setUsers } from './peopleActions';
import setAuthorizationToken from '../utils/setAuthorizationToken';

export function setCurrentUser(user) {
    return {
        type: SET_CURRENT_USER,
        user
    };
};

export function setModules(modules) {
    return {
        type: SET_MODULES,
        modules
    };
};

export function setIsLoaded(isLoaded) {
    return {
        type: SET_IS_LOADED,
        isLoaded
    };
};


export function setLogout() {
    return {
        type: LOGOUT
    };
};

export function getUserInfo(dispatch) {
    return api.getUser()
        .then((res) => dispatch(setCurrentUser(res.data.response)))
        .then(api.getModulesList)
        .then((res) => dispatch(setModules(res.data.response)))
        .then(api.getGroupList)
        .then((res) => dispatch(setGroups(res.data.response)))
        .then(api.getUserList)
        .then((res) => dispatch(setUsers(res.data.response)))
        .then(() => dispatch(setIsLoaded(true)));
};

export function login(data) {
    return dispatch => {
        return api.login(data)
            .then(res => {
                const token = res.data.response.token;
                setAuthorizationToken(token);
            })
            .then(() => getUserInfo(dispatch));
    }
};


export function logout() {
    return dispatch => {
        setAuthorizationToken();
        return dispatch(setLogout());
    };
};