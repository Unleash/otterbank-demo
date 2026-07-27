// Copy bank for the consent notice, keyed by variant payload. The two
// entries are the A/B arms: same gag, two designs. The backend picks one;
// the frontend renders whatever it receives.
export const consentDesigns = {
  classic: {
    design: 'classic',
    notice:
      'This agent requires explicit opt-in before flirting. GDPR applies in latent space too.',
    checkboxLabel: 'I consent to being charmed',
    withheldLabel: 'content withheld pending consent',
  },
  minimal: {
    design: 'minimal',
    notice: 'gdpr opt-in',
  },
};
