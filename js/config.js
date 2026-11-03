/** OWNER CONFIGURATION
 * DEMO MODE IS SAFE: All inquiries stay in THIS browser via localStorage.
 * To accept actual reservations AFTER owner's consent, change mode to 'netlify',
 * deploy on Netlify with Forms enabled, and configure form notifications.
 * The room descriptions/capacities and artwork are conceptual, not verified.
 */
window.AJV_CONFIG = {
  mode: 'demo', // 'demo' | 'netlify'
  propertyName: "AJV Mariner's Inn",
  publishedLocation: 'V. Enriquez Street, Tukuran, Zamboanga del Sur, Philippines',
  // Do not enable phone/Messenger CTAs until owner verifies these destinations.
  phone: '',
  messengerUrl: '',
  publicEmail: ''
};
