
const express = require('express');
const app = express();
const port = 5000
const config = require('./config/key');

const { User } = require('./models/User');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

mongoose.connect(config.mongoURI).then(()=> console.log('MongoDB Connected..') )
  .catch(err => console.log(err));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World! SK')
})

app.post('/register',(req,res) => {
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if(err) return res.json({success:false, err})
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/login',(req,res)=> {
  console.log('req.body.email :'+ req.body.email );
  //요청된 이메일이 있는지 확인
  User.findOne({ email: req.body.email }, (err, user) => {
    
    if(!user){
      console.log('user :'+ user );

      return res.json({
        loginSuccess: false,
        message: '제공된 이메일에 해당하는 유저가 없습니다.' })
    }

    // 비밀번호가 맞는 비밀번호 인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch){
        return res.json({      
        loginSuccess: false,
        message: '비밀번호가 틀렸습니다.'})
      }
      // 비밀번호 맞다면 토큰생성
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);
        // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
        res.cookie("x_auth", user.token)
        .status(200)
        .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})