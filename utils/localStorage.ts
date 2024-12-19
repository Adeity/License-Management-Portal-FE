import { LOCAL_USER_DATA, REMEMBER_ME_DATA } from './constants';

function readAuthData() {
    const jsonUserData = window.localStorage.getItem(LOCAL_USER_DATA) || '{}';

    const userData = JSON.parse(jsonUserData);


    const jsonRememberMeData = window.localStorage.getItem(REMEMBER_ME_DATA) || '{}';
    const rememberMeData = JSON.parse(jsonRememberMeData);
    return {
        resellerId:         userData.resellerId,
        user:               userData.user,
        rememberMeData:     rememberMeData,
        firstname:          userData.firstName,
        lastname:           userData.lastName,
        initials:           userData._initials,
        resellerAccountID:  userData.resellerAccountID,
        highestRole:        userData.highestRole,
        userId:             userData.userId
    };
}

function readAuthDataSync() {
    const jsonUserData = window.localStorage.getItem(LOCAL_USER_DATA) || '{}';
    const userData = JSON.parse(jsonUserData);

    return {
        resellerId:         userData.resellerId,
        user:               userData.user,
        firstname:          userData.firstName,
        lastname:           userData.lastName,
        initials:           userData._initials,
        resellerAccountID:  userData.resellerAccountID,
        highestRole:        userData.highestRole,
        userId:             userData.userId
    };
}

function enableTransferButton() {
    const jsonUserData = window.localStorage.getItem(LOCAL_USER_DATA) || '{}';
    const jsonObject = JSON.parse(jsonUserData);
    return (jsonObject.resellerAccountID===null || jsonObject.resellerAccountID===undefined) ? true : false;
}
function updateResellerOrganizationId(newResellerId: number) {
    let currentData = readAuthDataSync();
    const userData = {
        user:               currentData.user,
        resellerId:         newResellerId,
        firstName:          currentData.firstname,
        lastName:           currentData.lastname,
        _initials:          currentData.initials,
        resellerAccountID:  currentData.resellerAccountID,
        highestRole:        currentData.highestRole,
        userId:             currentData.userId
    };
    window.localStorage.setItem(LOCAL_USER_DATA, JSON.stringify(userData));
}
function saveAuthCredentials(user: string, resellerID: number, firstname: string, lastname: string, resellerAccountID: string, highestRoleSet: string, Id: number) {
    const userData = {
        user:               user,
        resellerId:         resellerID,
        firstName:          firstname,
        lastName:           lastname,
        _initials:          firstname.toUpperCase().slice(0,1) + lastname.toUpperCase().slice(0,1),
        resellerAccountID:  resellerAccountID,
        highestRole:        highestRoleSet,
        userId:             Id
    };
    window.localStorage.setItem(LOCAL_USER_DATA, JSON.stringify(userData));
}
function saveRememberMeData(user: string, rememberMe: boolean) {
    const RememberMeData = {
        user: rememberMe ? user : '',
        rememberMe: rememberMe,
    };
    window.localStorage.setItem(REMEMBER_ME_DATA, JSON.stringify(RememberMeData));
}
function clearAuthCredentials() {
    window.localStorage.removeItem(LOCAL_USER_DATA);
}
function clearRememberMeData() {
    window.localStorage.removeItem(REMEMBER_ME_DATA);
}
export const LocalStorage = {
    readAuthData,
    saveAuthCredentials,
    saveRememberMeData,
    clearAuthCredentials,
    clearRememberMeData,
    enableTransferButton,
    updateResellerOrganizationId
};
