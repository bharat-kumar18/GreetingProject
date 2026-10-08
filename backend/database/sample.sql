INSERT INTO templates (name, occasion, file_name, file_path)
VALUES
('Birthday Template', 'Happy Birthday', 'birthday.svg', 'backend/templates/birthday.svg'),
('Congratulations Template', 'Congratulations', 'congratulations.svg', 'backend/templates/congratulations.svg'),
('Welcome Template', 'Welcome', 'welcome.svg', 'backend/templates/welcome.svg')
ON CONFLICT DO NOTHING;

INSERT INTO recipients (name, email, occasion, message)
VALUES
('Rahul Sharma', 'rahul@example.com', 'Happy Birthday', 'Have a fantastic year ahead!'),
('Priya Mehta', 'priya@example.com', 'Happy Birthday', 'Wishing you lots of happiness!'),
('Aman Verma', 'aman@example.com', 'Congratulations', 'Keep achieving great things!'),
('Neha Jain', 'neha@example.com', 'Work Anniversary', 'Thank you for being a valuable part of the team.'),
('Rohit Patel', 'rohit@example.com', 'Welcome', 'We are happy to have you with us!');
