// Save token
export const saveAuth = (data: {
    token: string;
    name: string;
    email: string;
    role: string;
}) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.name);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
};

// Get token
export const getToken = () => {
    return localStorage.getItem('token');
};

// Get user
export const getUser = () => {
    return {
        name: localStorage.getItem('name'),
        email: localStorage.getItem('email'),
        role: localStorage.getItem('role'),
    };
};

// Check if logged in
export const isLoggedIn = () => {
    return !!localStorage.getItem('token');
};

// Logout
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
};