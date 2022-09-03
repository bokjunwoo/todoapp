const express = require('express');
const app = express();

app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs') // ejs 사용

app.use('/public', express.static('public')); //public 사용

const metoedOverride = require('method-override'); //metoedOverride 사용
app.use(metoedOverride('_method'));

var db; // 어떤 변수에 저장
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://junu:qwe123@cluster0.dkrrnaq.mongodb.net/?retryWrites=true&w=majority', function(에러, client){
    // 연결되면 할일
    if(에러) return console.log(에러)

    db = client.db('todoapp') // 데이터 저장

    app.listen(8080, function(){
        console.log('listening on 8080');
    });

});

/* Main */
//메인페이지 요청
app.get('/', function(요청, 응답){
    응답.render('index.ejs')
});

/* Write*/
//글쓰기페이지 요청
app.get('/write', function(요청, 응답){
    응답.render('write.ejs')
});

//어떤 사람이 /add 경로로 POST 요청을 하면 ?? 를 해주세요
// 어떤 사람이 /add 라는 경로로 post 요청을 하면, 데이터 2개(날짜, 제목)를 보내주는데 이 때 'post'라는 이름을 가진 collection에 두개 데이터를 저장하기
app.post('/add', function(요청, 응답){ //findOne 하나를 찾는다
    
    db.collection('counter').findOne({name : '게시물 개수'}, function(에러, 결과){
        console.log(결과.totalPost);
        const 총게시물갯수 = 결과.totalPost;

        // counter라는 콜렉션에 있는 totalPost 라는 항목도 1증가 시켜야함
        db.collection('post').insertOne({_id : 총게시물갯수 + 1, 제목 : 요청.body.title, 날짜 : 요청.body.date}, function(에러, 결과){
            console.log('저장완료');

            // db.collection('counter').updateOne 데이터 하나를 수정 ({어떤데이터를 수정할지},{수정값},function())  $set -> operator
            db.collection('counter').updateOne ({name:'게시물 개수'},{$inc:{totalPost:1}},function(에러, 결과){
                // {$set:{totalPost:바꿀 값}}
                // {$inc:{totalPost:기존값에 더해줄 값}}
                if(에러){
                    return console.log(에러)
                };
            });  
        }); 
    });
    응답.redirect('/list');
});

/* List */
// 리스트 요청
app.get('/list', function(요청, 응답){
    //db에 저장된 post라는 collection안의 데이터를 꺼내주세요 .sort({'_id':-1}) -> 내림차순 (숫자 1은 오름차순)
    db.collection('post').find().sort({'_id':-1}).toArray(function(에러, 결과){ //.find().toArray 모든 데이터 가져온다
        console.log(결과);
        응답.render('list.ejs', {posts : 결과}); //찾을 걸 ejs파일에 넣어주세요
    }); 
});
// 리스트 삭제 기능
app.delete('/delete', function(요청, 응답){
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id); //정수 변환

    //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아 삭제하기
    //db.collection('post').deleteOne({어떤항목 삭제할지}, function(){})
    db.collection('post').deleteOne(요청.body, function(에러, 결과){
        console.log('삭제완료');
        응답.status(200).send({message : '성공했습니다'}); //응답코드와 메세지 보내주세요
    });
});

/* Detail */
// 상세정보로 요청
app.get('/detail/:id', function(요청, 응답){ // :id -> 문자열입력하면 보여줌
    요청.params.id = parseInt(요청.params.id); // id를 정수로 변경
    
    // db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과)
    db.collection('post').findOne({_id : 요청.params.id}, function(에러, 결과){ //params중 입력한 id라는 뜻
        console.log(결과);
        
        if(응답) {
            응답.render('detail.ejs', {data : 결과});
        }
        
    });
});

/* Edit */
// 수정페이지 요청
app.get('/edit/:id', function(요청, 응답){

    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
        console.log(결과);
        응답.render('edit.ejs', {post : 결과});
    })
});

// 수정 기능
app.put('/edit', function(요청, 응답){
    // 폼에 담긴 제목,날짜 데이터를 가지고 db.collection에 업데이트함
    // .updateOne({_i: ??}, {$set : {$set->업데이트 해주세요 : {제목 : ??, 날짜 : ??}}, function(에러, 결과){})
    db.collection('post').updateOne({_id : parseInt(요청.body.id)}, {$set : { 제목 : 요청.body.title , 날짜 : 요청.body.date }}, function(에러, 결과){
        console.log('수정완료');
        응답.redirect('/list'); //redirect 이동
    })
});

/* Mypage */
// 마이페이지 요청
app.get('/mypage', 로그인했니, function(요청, 응답){
    console.log(요청.user);
    응답.render('mypage.ejs', {사용자 : 요청.user})
});

/* 미들웨어 */
// 로그인여부 미들웨어 (만드는 법)
function 로그인했니(요청, 응답, next){
    if(요청.user){
        next()
    } else {
        응답.send('로그인필요')
    }
}

/* Sign up */
// 회원가입 요청
app.get('/signup', function(요청, 응답){
    응답.render('signup.ejs')
})

// 회원가입 중복검사
app.post('/signup', function(요청, 응답){
    
    db.collection('login').findOne({id : 요청.body.id}, function(에러, 결과){
        console.log('입력완료');
        if(결과?.id === 요청.body.id) {
            응답.send('아이디 중복 입니다')
        } else {
            db.collection('login').insertOne({id : 요청.body.id, pw : 요청.body.pw}, function(에러, 결과){
                console.log('입력완료');
                응답.redirect('/login');
            });
        };
    });
});

/* Logout */
// 로그아웃 페이지
app.get('/logout', function(요청, 응답){
    요청.logout(function (에러) {
        if(에러) { 
            return next(에러); 
        }
        응답.redirect('/');
    });
});

/* Login */
// 로그인 기능
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// 요청 - 응답 중간에 뭔가 실행되는 코드
app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session()); 

// 로그인페이지 요청
app.get('/login', function(요청, 응답){
    응답.render('login.ejs')
});

// 로그인 시도를 할 경우 passport는 성공여부와 관계없이 session을 생성함.
// 해당 session에 object 형식으로 message라는 키와 각 조건에 맞는 value가 추가 됨.
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done()
        if (!결과) return done(null, false, { message: '유효하지 않은 아이디입니다.' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '유효하지 않은 비밀번호입니다.' })
        }
    })
}));

// 사용자가 /login에서 로그인을 시도할 경우 session에 정보가 저장되는데
// 아래 코드에서는 info가 세션정보임.
// console로 info를 출력해보면 쿠키를 비롯해 로그인 시도 결과에 대해서 message로 알려줌. 성공시에는 undefined.
// info.message에는 로그인에 실패한 이유가 담기게 되고, 이 결과를 각 조건에 맞게 alert 창이나 html에 추가해 뿌려주면 됨.
app.post('/login', function (요청, 응답, next) {
    passport.authenticate('local', function (에러, user, info) {
        console.log('info', info);
        if (에러) {
            return next(에러);
        }
        if (!user) {
            요청.session.save(function () {
                응답.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                응답.write(`<script>alert(' ${info.message} ')</script>`);
                응답.write("<script>window.location=\"/login\"</script>");
            });
            return;
        }
        요청.logIn(user, function (에러) {
            if (에러) { return next(에러); }
            요청.session.save(function () {
                응답.redirect('/');
            });
        });
    })(요청, 응답, next);
});

// app.post('/login',//검사하세요,function(요청, 응답){
//     응답.render('login.ejs')
// });

// 로그인 페이지 
// app.post('/login', passport.authenticate('local', {
//     failureRedirect : '/fall' // 실패하면 fall로 보내주세요
// }), function(요청, 응답){
//     응답.redirect('/')
// });

//세션을 저장시키는 코드(성공시 발동)
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// 나중에 마이페이지 접속
// 로그인한 유저의 개인정보를 db에서 찾는 역활
// db에서 위에있는 user.id로 유저를 찾은 뒤에 유저정보를
// done(null, {여기에 넣음})
passport.deserializeUser(function (아이디, done) {
    db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
        done(null, 결과)
    })
});


