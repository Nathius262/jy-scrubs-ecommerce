import { messageAlert } from "./utils.js"

(function () {
  'use strict'
  //loading status
  let statusEl = document.getElementById('status')
  let btn = document.getElementById('btn')
  let displayError = document.querySelector('#error')

  //message

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', async function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        else {
          event.preventDefault()
          event.stopPropagation()

          statusEl.classList.remove('d-none')
          btn.classList.add('disabled')
          displayError.innerHTML = ""

          const form = event.target;
          const formData = new FormData(form);
          const url = form.action;
          const formDataObj = JSON.stringify(Object.fromEntries(formData))

          try {

            let method;

            if (form.id == "update-user-form") {
              method = "PUT";
              console.log("updating ...")
            } else {
              method = "POST";
              console.log("creating...")
            };

            const response = await authenticate(formDataObj, url, method);
            const result = await response.json();

            if (response.ok) {
              messageAlert(
                title = "success",
                message = result.message,
                redirectTo = result.redirectTo,
                classType = "text-success",
                btnType = "btn-success",
              )

            }
            else {
              try {
                for (let i of result.errors) {
                  displayError.insertAdjacentHTML(
                    'beforeend',
                    `<li>${i.msg}</li>`

                  )
                  console.log(i.msg)
                }
              } catch {
                let errMessage;
                if (result.detail) errMessage = result.detail
                else if (result.message) errMessage = result.message;
                displayError.insertAdjacentHTML(
                  'beforeend',
                  `<li>${errMessage}</li>`
                )
              }
            }
          }
          catch (error) {
            console.log(error)
            messageAlert(
              title = "Error!",
              message = "Something went wrong: click the button to refresh",
              redirectTo = false,
              classType = "text-danger",
              btnType = "btn-danger",
            )
          }
          finally {
          }
          statusEl.classList.add('d-none')
          btn.classList.remove('disabled')
        }

        form.classList.add('was-validated')
      }, false)
    })


  //DELETE USER

  try {
    let deleteBtn = document.querySelectorAll('.delete-user-btn');

    for (let i of deleteBtn) {
      i.addEventListener('click', async () => {
        try {
          console.log('deleting');

          // Disable the specific button and show the spinner
          i.classList.add('disabled');
          const spinner = document.createElement('div');
          spinner.className = 'spinner-border spinner-border-sm text-light'; // Spinner style
          spinner.role = 'status';
          i.innerHTML = ''; // Clear button text
          i.appendChild(spinner); // Append spinner to button

          //displayError.innerHTML = ''; // Clear previous errors

          let url = i.dataset.url;
          let method = 'DELETE';
          let data = JSON.stringify({});

          const response = await authenticate(data, url, method);

          // Check if response is valid
          if (!response || !response.ok) {
            throw new Error('Failed to delete user. Invalid response.');
          }

          // Check if response headers are available and contains JSON
          let result;
          if (response.headers && response.headers.get('content-type')?.includes('application/json')) {
            result = await response.json();
          } else {
            result = {}; // Set result to empty if there's no valid JSON response
          }

          console.log(result);

          if (response.ok) {
            messageAlert(
              (title = 'Alert'),
              (message = 'User has been deleted'),
              (redirectTo = result.redirectTo || '/admin'), // Fallback to homepage if redirectTo is undefined
              (classType = 'text-danger'),
              (btnType = 'btn-danger')
            );
          } else {
            if (result.errors) {
              for (let error of result.errors) {
                displayError.insertAdjacentHTML('beforeend', `<li>${error.msg}</li>`);
              }
            } else {
              let errMessage = result.detail || result.message || 'An unknown error occurred';
              displayError.insertAdjacentHTML('beforeend', `<li>${errMessage}</li>`);
            }
          }
        } catch (error) {
          console.error('Error occurred while deleting user:', error);
          displayError.insertAdjacentHTML('beforeend', `<li>Failed to delete user. Please try again later.</li>`);
        } finally {
          // Remove the spinner and re-enable the button after the request finishes
          i.innerHTML = 'Delete'; // Restore button text
          i.classList.remove('disabled');
        }
      });
    }


  } catch (error) {

  }



})()


async function authenticate(data, url, method) {
  return fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  }).then(response => {
    return {
      ok: response.ok,
      status: response.status,
      json: () => response.json()
    };
  }).catch(error => {
    throw new Error('Network error: ', error);
  });
}