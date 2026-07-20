fetch('http://localhost:3000/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test Email User',
    email: 'riteshrnair345@gmail.com',
    phone: '9876543210',
    age: '25',
    proficiency: 'Beginner',
    duration: '1-2 hours',
    shoes: 'Yes',
    heardFrom: 'Friend'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
