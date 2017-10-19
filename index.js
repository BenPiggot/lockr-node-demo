const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const LockrJS = require('lockr-js');
const Lockr = LockrJS.Lockr;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret:'qeofphjeq8492pdsdad',
  resave: false,
  saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/keys', (req, res) => {
  res.render('keys')
})

app.post('/getcert', (req, res) => {
  const p = new Lockr(new LockrJS.Partner());
  const kc = new LockrJS.KeyClient(p)
  const sc = new LockrJS.SiteClient(p)

  const distinguishedName = {
    O: "Ben",
    L: "Seattle",
    ST: "Washington",
    C: "US"
  }

  sc.createCert(distinguishedName).then(response => {
    const Lockr = LockrJS.Lockr;
    const p1 = new LockrJS.Partner((response.cert_text + response.key_text))
    const lockrPartner = new Lockr(p1)
    req.session.lockrPartner = lockrPartner   
    req.session.siteClient = new LockrJS.SiteClient(lockrPartner)
    req.session.keyClient = new LockrJS.KeyClient(lockrPartner)
    req.session.keyClient.encrypted(req.body.key)
    res.render('cert', { cert: response.cert_text, key: response.key_text })
  })
});

app.post('/register', (req, res) => {
  const partner = new LockrJS.Partner(req.session.lockrPartner)
  const newLockrPartner = new Lockr(partner)
  const newSC = new LockrJS.SiteClient(newLockrPartner)
  newSC.register(req.body.email).then(response => {
    if (response) {
      res.render('keys')
    }
  })
})

app.post('/setkeys', (req, res) => {
  const partner = new LockrJS.Partner(req.session.lockrPartner)
  const newLockrPartner = new Lockr(partner)
  const newKC = new LockrJS.KeyClient(newLockrPartner)
  req.session.keyClient.set('my_key', 'my super secret key value', 'My Key').then(response => {
    res.send("Success!")
  });
})

app.listen(3000)

