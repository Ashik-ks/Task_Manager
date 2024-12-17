exports.scheduleReminder = function (title, description, dueDate, userName, userEmail) {
    return new Promise(async (resolve, reject) => {
        console.log("Task Details : ", title, description, dueDate);
        console.log("User Details : ", userName, userEmail);

        try {
            let template = `
                <html>
    <head>
        <style>
            /* Global Styles */
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                padding: 30px;
                color: #333;
            }

            /* Header */
            h2 {
                color: #FF5733; /* Warm Orange */
                font-size: 28px;
                margin-bottom: 20px;
                text-align: center;
            }

            /* Text */
            p {
                font-size: 16px;
                line-height: 1.6;
                color: #555;
            }

            .strong-text {
                font-weight: bold;
                color: #2C3E50; /* Dark Gray for emphasis */
            }

            /* Task Details */
            ul {
                list-style-type: none;
                padding: 0;
                margin-top: 20px;
            }

            li {
                font-size: 16px;
                margin-bottom: 10px;
            }

            .task-details {
                background-color: #f1f1f1;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #ddd;
            }

            .task-details li {
                color: #333;
            }

            /* Footer */
            .footer {
                margin-top: 30px;
                font-size: 14px;
                color: #999;
                text-align: center;
            }

            .footer a {
                color: #FF5733;
                text-decoration: none;
            }

            .footer a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Task Reminder</h2>
            <p>Hi <span class="strong-text">${userName}</span>,</p>
            <p>This is a reminder that the task <strong>${title}</strong> is due soon.</p>

            <p><strong>Task Details:</strong></p>
            <ul class="task-details">
                <li><strong>Title:</strong> ${title}</li>
                <li><strong>Description:</strong> ${description}</li>
                <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleString()}</li>
            </ul>

            <p>We hope you complete the task on time!</p>

            <div class="footer">
                <p>Best regards,</p>
                <p>Your Task Management Team</p>
                <p><a href="#">Unsubscribe</a> from notifications.</p>
            </div>
        </div>
    </body>
</html>

            `;
            resolve(template);
        } catch (error) {
            reject(error);
        }
    });
};
