

export const checkRole = (userRole, allowedRoles = []) => {
    if (allowedRoles.length === 0) return true; // open route
    return allowedRoles.includes(userRole);
  };
  