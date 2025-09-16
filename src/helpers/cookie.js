
// Extract token  from cookies
export const getRefreshTokenFromCookie = (req) => {
    return req.cookies?.refreshToken || null;
  };
  
  // Extract role from cookies (if stored separately)
  export const getRoleFromCookie = (req) => {
    return req.cookies?.role || null;
  };
  