function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }

  const contactForm = document.getElementById('contactForm');
  if (!contactForm) {
    return;
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    ['name', 'email', 'message'].forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      const errorSpan = document.getElementById(`${fieldId}Error`);
      if (field) {
        field.classList.remove('error');
      }
      if (errorSpan) {
        errorSpan.textContent = '';
      }
    });

    const responseMessage = document.getElementById('responseMessage');
    if (responseMessage) {
      responseMessage.textContent = '';
    }

    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const messageField = document.getElementById('message');

    const name = nameField?.value.trim() ?? '';
    const email = emailField?.value.trim() ?? '';
    const message = messageField?.value.trim() ?? '';

    let isValid = true;

    if (name.length < 2) {
      nameField?.classList.add('error');
      const error = document.getElementById('nameError');
      if (error) error.textContent = 'Please enter at least 2 characters.';
      isValid = false;
    }

    if (!isValidEmail(email)) {
      emailField?.classList.add('error');
      const error = document.getElementById('emailError');
      if (error) error.textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    if (message.length < 10) {
      messageField?.classList.add('error');
      const error = document.getElementById('messageError');
      if (error) error.textContent = 'Please enter at least 10 characters.';
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const honeypotField = contactForm.querySelector('input[name="_hp"]');
    if (honeypotField?.value) {
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn?.textContent ?? 'Submit';
    if (submitBtn) {
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const formData = new FormData(contactForm);
      const payload = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        payload.append(key, String(value));
      }

      const response = await fetch('/__forms/contact', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const thankYouUrl = new URL('/thank-you/', window.location.origin).pathname;
      window.location.assign(thankYouUrl);
    } catch (error) {
      console.error('Form submission error:', error);
      if (submitBtn) {
        submitBtn.setAttribute('aria-busy', 'false');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
      if (responseMessage) {
        responseMessage.textContent = 'Sorry, there was an error sending your message. Please try again.';
      }
    }
  });
});
