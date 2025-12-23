export const ADMIN_EMAIL = "Sivaraj.Ramar@agilisium.com";

export const isAdmin = (email) =>
  email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
