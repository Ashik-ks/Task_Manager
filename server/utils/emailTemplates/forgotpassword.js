exports.forgetPassword = function (name, url) {
  return new Promise(async (resolve, reject) => {
    try {
      let template = `
            <html style="box-sizing: border-box; --bs-blue: #0d6efd; --bs-indigo: #6610f2; --bs-purple: #6f42c1; --bs-pink: #d63384; --bs-red: #dc3545; --bs-orange: #fd7e14; --bs-yellow: #ffc107; --bs-green: #198754; --bs-teal: #20c997; --bs-cyan: #0dcaf0; --bs-black: #000; --bs-white: #fff; --bs-gray: #6c757d; --bs-gray-dark: #343a40; --bs-gray-100: #f8f9fa; --bs-gray-200: #e9ecef; --bs-gray-300: #dee2e6; --bs-gray-400: #ced4da; --bs-gray-500: #adb5bd; --bs-gray-600: #6c757d; --bs-gray-700: #495057; --bs-gray-800: #343a40; --bs-gray-900: #212529; --bs-primary: #0d6efd; --bs-secondary: #6c757d; --bs-success: #198754; --bs-info: #0dcaf0; --bs-warning: #ffc107; --bs-danger: #dc3545; --bs-light: #f8f9fa; --bs-dark: #212529; --bs-primary-rgb: 13, 110, 253; --bs-secondary-rgb: 108, 117, 125; --bs-success-rgb: 25, 135, 84; --bs-info-rgb: 13, 202, 240; --bs-warning-rgb: 255, 193, 7; --bs-danger-rgb: 220, 53, 69; --bs-light-rgb: 248, 249, 250; --bs-dark-rgb: 33, 37, 41; --bs-white-rgb: 255, 255, 255; --bs-black-rgb: 0, 0, 0; --bs-body-color-rgb: 33, 37, 41; --bs-body-bg-rgb: 255, 255, 255; --bs-font-sans-serif: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', 'Liberation Sans', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; --bs-font-monospace: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; --bs-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0)); --bs-body-font-family: var(--bs-font-sans-serif); --bs-body-font-size: 1rem; --bs-body-font-weight: 400; --bs-body-line-height: 1.5; --bs-body-color: #212529; --bs-body-bg: #fff; --bs-border-width: 1px; --bs-border-style: solid; --bs-border-color: #dee2e6; --bs-border-color-translucent: rgba(0, 0, 0, 0.175); --bs-border-radius: 0.375rem; --bs-border-radius-sm: 0.25rem; --bs-border-radius-lg: 0.5rem; --bs-border-radius-xl: 1rem; --bs-border-radius-2xl: 2rem; --bs-border-radius-pill: 50rem; --bs-link-color: #0d6efd; --bs-link-hover-color: #0a58ca; --bs-code-color: #d63384; --bs-highlight-bg: #fff3cd;">
              <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
              </head>

             <body style="background-color: #f9fafb; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0;">
  <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 28rem; width: 100%;">
    <div style="text-align: center; margin-bottom: 16px;">
      <a href="#" style="font-size: 0.875rem; color: #6b7280; text-decoration: none;">Display in your browser</a>
    </div>
    <div style="display: flex; align-items: center; margin-bottom: 24px;">
     <h1 style="display: flex; gap: 0.25rem; align-items: center;">
  <p style="background-color: #ef4444; padding: 0.5rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
    <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" style="width: 1.5rem; height: 1.5rem; font-weight: 700;">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm5 4h-2v-2h2v2zm0-4h-2V7h2v5z"/>
    </svg>
  </p>
  <span style="font-size: 1.25rem; font-weight: 700; color: #000000; margin-right: 10px">TaskUp</span>
</h1>

      <h1 style="font-size: 1.25rem; font-weight: 600; color: #374151; margin: 0;">Password Reset</h1>
    </div>
    <p style="color: #374151; margin-bottom: 16px;">${name}</p>
    <p style="color: #374151; margin-bottom: 16px;">Forgot your password? Let’s get you a new one:</p>
    <div style="text-align: center; margin-bottom: 24px;">
          <a href="${url}"> <button style="background-color: red; color: #374151; margin-bottom: 16px;" onsubmit="password(event)">Reset Password</button>
 </a>
    </div>
    <p style="color: #374151; margin-bottom: 24px;">If you didn’t request a password reset, ignore this email. Your password will stay the same.</p>
    <p style="color: #374151; margin-bottom: 24px;">Productively,</p>
    <div style="text-align: center; margin-bottom: 24px;">
      <img alt="The Todoist team signature" src="https://storage.googleapis.com/a1aa/image/3ele28mPeiDboI2AIhfqu9bkPHz6f4FnjrzR87h0scIocYhfE.jpg" style="width: 150px; height: auto; display: block; margin: 0 auto;" />
    </div>
    <div style="background-color: #fef2f2; padding: 16px; border-radius: 12px; text-align: center;">
      <p style="color: #374151; margin: 0;">Have questions or need help? 
        <a href="#" style="color: #3b82f6; text-decoration: none;">Get in touch with us.</a>
      </p>
    </div>
  </div>
</body>

          </html>                 
            `;
      resolve(template);
    }
    catch (error) {
      //console.log(error);
      reject(error);
    }
  })
};