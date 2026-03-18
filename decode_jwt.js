const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZnBiem5wdWhrZHh6Y3dudmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTcxMzQsImV4cCI6MjA4OTM5MzEzNH0.WQfBP-0WvlsjyyBWps2OSCu_1-AsyOHbaipOxJe3vKEy";
const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString('utf8'));
console.log(payload);
