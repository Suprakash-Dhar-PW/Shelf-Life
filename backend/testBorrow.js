const http = require('http');
require('dotenv').config();

const librarianPassword = process.env.SEED_LIBRARIAN_PASSWORD;
if (!librarianPassword) {
  console.error('Error: SEED_LIBRARIAN_PASSWORD environment variable is missing.');
  process.exit(1);
}

async function doReq(method, path, token, body) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data||'{}') }));
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('Logging in...');
  const login = await doReq('POST', '/api/auth/login', null, {email: 'librarian@shelflife.com', password: librarianPassword});
  const token = login.data.token;
  
  console.log('Creating book with 2 copies...');
  const bookRes = await doReq('POST', '/api/books', token, {
    title: 'Test Book', author: 'Author', ISBN: 'ISBN-TEST-1', genre: 'Sci-Fi', totalCopies: 2
  });
  let bookId = bookRes.data.data._id;
  
  console.log('Creating member...');
  const memRes = await doReq('POST', '/api/members', token, {
    name: 'Test Member', email: 'test@example.com', membershipId: 'MEM-1'
  });
  let memberId = memRes.data.data._id;
  
  console.log('1. Issue available book');
  const issue1 = await doReq('POST', '/api/borrow', token, { bookId, memberId, dueDate: new Date(Date.now() + 86400000).toISOString() });
  console.log(issue1.status === 201 ? 'SUCCESS' : 'FAIL', issue1.status);
  
  console.log('2. Issue last available copy');
  const issue2 = await doReq('POST', '/api/borrow', token, { bookId, memberId, dueDate: new Date(Date.now() + 86400000).toISOString() });
  console.log(issue2.status === 201 ? 'SUCCESS' : 'FAIL', issue2.status);
  
  console.log('3. Attempt another issue');
  const issue3 = await doReq('POST', '/api/borrow', token, { bookId, memberId, dueDate: new Date(Date.now() + 86400000).toISOString() });
  console.log(issue3.status === 409 ? 'SUCCESS' : 'FAIL', issue3.status, issue3.data.message);
  
  console.log('4. Return book');
  const borrowId = issue1.data.data._id;
  const ret1 = await doReq('POST', '/api/return/' + borrowId, token, {});
  console.log(ret1.status === 200 ? 'SUCCESS' : 'FAIL', ret1.status);
  
  console.log('5. Attempt duplicate return');
  const ret2 = await doReq('POST', '/api/return/' + borrowId, token, {});
  console.log(ret2.status === 400 ? 'SUCCESS' : 'FAIL', ret2.status, ret2.data.message);
  
  console.log('6. Invalid member');
  const invMem = await doReq('POST', '/api/borrow', token, { bookId, memberId: '000000000000000000000000', dueDate: new Date(Date.now() + 86400000).toISOString() });
  console.log(invMem.status === 404 ? 'SUCCESS' : 'FAIL', invMem.status, invMem.data.message);
  
  console.log('7. Invalid book');
  const invBook = await doReq('POST', '/api/borrow', token, { bookId: '000000000000000000000000', memberId, dueDate: new Date(Date.now() + 86400000).toISOString() });
  console.log(invBook.status === 409 ? 'SUCCESS (409 because query fails)' : 'FAIL', invBook.status, invBook.data.message);
  
  console.log('8. Concurrent issue attempts against one remaining copy (1 copy is available now due to return in step 4)');
  const [c1, c2] = await Promise.all([
    doReq('POST', '/api/borrow', token, { bookId, memberId, dueDate: new Date(Date.now() + 86400000).toISOString() }),
    doReq('POST', '/api/borrow', token, { bookId, memberId, dueDate: new Date(Date.now() + 86400000).toISOString() })
  ]);
  const statuses = [c1.status, c2.status].sort();
  console.log(statuses[0] === 201 && statuses[1] === 409 ? 'SUCCESS' : 'FAIL', statuses);
}

run();
