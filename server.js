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

//index 페이지
app.get('/', function(요청, 응답){
    응답.render('index.ejs')
});

//write 페이지
app.get('/write', function(요청, 응답){
    응답.render('write.ejs')
});


//어떤 사람이 /add 경로로 POST 요청을 하면 ?? 를 해주세요
// 어떤 사람이 /add 라는 경로로 post 요청을 하면, 데이터 2개(날짜, 제목)를 보내주는데 이 때 'post'라는 이름을 가진 collection에 두개 데이터를 저장하기
// {제목 : '어쩌구', 날짜 : '어쩌구'}
app.post('/add', function(요청, 응답){ //findOne 하나를 찾는다
    //응답.send('전송완료');
    
    db.collection('counter').findOne({name : '게시물 개수'}, function(에러, 결과){
        console.log(결과.totalPost);
        const 총게시물갯수 = 결과.totalPost;

        db.collection('post').insertOne({_id : 총게시물갯수 + 1, 제목 : 요청.body.title, 날짜 : 요청.body.date}, function(에러, 결과){
            console.log('저장완료');

            // counter라는 콜렉션에 있는 totalPost 라는 항목도 1증가 시켜야함
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



// list로 GET요청으로 접속하면 실제 DB에 저장된 데이터들로 HTML을 보여줌
app.get('/list', function(요청, 응답){
    //db에 저장된 post라는 collection안의 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(에러, 결과){ //.find().toArray 모든 데이터 가져온다
        console.log(결과);
        응답.render('list.ejs', {posts : 결과}); //찾을 걸 ejs파일에 넣어주세요
    }); 
});

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

// /detail로 접속하면 detail.ejs 보여줌
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

// edit 페이지
app.get('/edit/:id', function(요청, 응답){

    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
        console.log(결과);
        응답.render('edit.ejs', {post : 결과});
    })
});

app.put('/edit', function(요청, 응답){
    // 폼에 담긴 제목,날짜 데이터를 가지고 db.collection에 업데이트함
    // .updateOne({_i: ??}, {$set : {$set->업데이트 해주세요 : {제목 : ??, 날짜 : ??}}, function(에러, 결과){})
    db.collection('post').updateOne({_id : parseInt(요청.body.id)}, {$set : { 제목 : 요청.body.title , 날짜 : 요청.body.date }}, function(에러, 결과){
        console.log('수정완료');
        응답.redirect('/list'); //redirect 이동
    })
});

// 로그인 기능
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// 요청 - 응답 중간에 뭔가 실행되는 코드
app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session()); 

app.get('/login', function(요청, 응답){
    응답.render('login.ejs')
});

// app.post('/login',//검사하세요,function(요청, 응답){
//     응답.render('login.ejs')
// });

// 로그인 페이지
app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fall' // 실패하면 fall로 보내주세요
}), function(요청, 응답){
    응답.redirect('/')
});

// 마이페이지
app.get('/mypage', 로그인했니, function(요청, 응답){
    console.log(요청.user);
    응답.render('mypage.ejs', {사용자 : 요청.user})
});

// 미들웨어 만드는 법
function 로그인했니(요청, 응답, next){
    if(요청.user){
        next()
    } else {
        응답.send('로그인 안했습니다')
    }
}

// 회원가입 페이지
app.get('/signup', function(요청, 응답){
    응답.render('signup.ejs')
})

app.post('/signup', function(요청, 응답){
    db.collection('login').insertOne({id : 요청.body.id, pw : 요청.body.pw}, function(에러, 결과){
        console.log('입력완료');
        응답.redirect('/login');
    })
})


// 인증방법
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과) //done(서버에러->null, 성공시사용자db데이터, 에러메세지)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

//세션을 저장시키는 코드(성공시 발동)
passport.serializeUser(function(user, done){
    done(null, user.id)
});

// 나중에 마이페이지 접속
passport.deserializeUser(function(아이디, done){
    //로그인한 유저의 개인정보를 db에서 찾는 역활
    //db에서 위에있는 user.id로 유저를 찾은 뒤에 유저정보를
    //done(null, {여기에 넣음})
    db.collection('login').findOne({id : 아이디}, function(에러, 결과){
        done(null, 결과)
    })   
});
