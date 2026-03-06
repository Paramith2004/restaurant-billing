export const saveAuth = (data: {
    id: string;
    token: string;
    name: string;
    email: string;
    role: string;
}) => {
    localStorage.setItem('id', data.id);
    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.name);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
};

export const getToken = () => localStorage.getItem('token');

export const getUser = () => ({
    id: localStorage.getItem('id'),
    name: localStorage.getItem('name'),
    email: localStorage.getItem('email'),
    role: localStorage.getItem('role'),
});

export const isLoggedIn = () => !!localStorage.getItem('token');

// Admin — developer/maintainer
export const isAdmin = () => localStorage.getItem('role') === 'admin';

// Owner — restaurant owner
export const isOwner = () => localStorage.getItem('role') === 'owner';

// Admin or Owner
export const isAdminOrOwner = () =>
    isAdmin() || isOwner();

export const logout = () => {
    localStorage.removeItem('id');
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
};