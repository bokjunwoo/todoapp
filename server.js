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

        var 저장할거 = {_id : 총게시물갯수 + 1, 제목 : 요청.body.title, 날짜 : 요청.body.date, 작성자 : 요청.user._id, 이름 : 요청.user.id}

        // counter라는 콜렉션에 있는 totalPost 라는 항목도 1증가 시켜야함
        db.collection('post').insertOne(저장할거, function(에러, 결과){
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
    응답.write("<script>window.location=\"/list\"</script>");
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

    var 삭제할데이터 = { _id : 요청.body._id, 작성자 : 요청.user._id};

    //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아 삭제하기
    //db.collection('post').deleteOne({어떤항목 삭제할지}, function(){})
    db.collection('post').deleteOne(삭제할데이터, function(에러, 결과){
        console.log('삭제완료');
        if(에러) {
            console.log(에러);
        }
        응답.status(200).send({message : '성공했습니다'}); //응답코드와 메세지 보내주세요
    });
});
// 리스트 검색 기능
app.get('/search', (요청, 응답) => {
    console.log(요청.query.value); // 제목 : 요청.query.value는 일치하는 것만 찾아줌
    // db.collection('post').find({제목 : 요청.query.value}).toArray((에러, 결과) => {
    // 위 코드의 문제점 -> 1. 같은 값만 찾아옴 2. find()로 찾으면 데이터가 많을수록 오래 걸림 -> indexing해둔다
    // Binary Search 적용 반으로 쪼개서 값을 찾음 -> 미리 정렬(indexing)하면 db는 알아서(Binary Search)함
    
    // $text : {$search: '값'} 만든 index에 의해 검사
    // 1. 빠른검색 2. or검색 3. -제외가능 4. ""정확히 일치하는 것만
    // 단점 : 한글친화적이 아님 띄어쓰기로 결과를 찾음 -> search index사용
    // db.collection('post').find( {$text: { $search: 요청.query.value } }).toArray((에러, 결과) => {
    //     console.log(결과);
    //     응답.render('search.ejs', {posts : 결과});
    // });

    // .aggregate({},{},{}) {안에 원하는 데이터를 넣을 수 있다}
    var 검색조건 = [
        {
            $search: {
                index: 'titleSearch',
                text: {
                    query: 요청.query.value,
                    path: '제목' // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
                }
            }
        },
        { $sort : { _id : -1 }}, // 정렬
        { $limit : 5 }, // 숫자만큼 보여줌(상위)
        // { $project : { 제목: 1, _id: 0, score: { $meta: 'searchScore'}}} // 점수로 정렬
    ]
    db.collection('post').aggregate(검색조건).toArray((에러, 결과) => {
        응답.render('search.ejs', {posts : 결과});
        console.log(결과);
    });
   
});

/* Detail */
// 상세정보로 요청
app.get('/detail/:id', function(요청, 응답){ // :id -> 문자열입력하면 보여줌
    요청.params.id = parseInt(요청.params.id); // id를 정수로 변경
    
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
        응답.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        응답.write(`<script>alert('로그인이 필요합니다.')</script>`);
        응답.write("<script>window.location=\"/login\"</script>");
    }
}

/* Sign up */
// 회원가입 요청
app.get('/signup', function(요청, 응답){
    응답.render('signup.ejs')
})

// 회원가입 중복검사
// app.post('/signup', function(요청, 응답){
    
//     db.collection('login').findOne({id : 요청.body.id}, function(에러, 결과){
//         console.log('입력완료');
//         if(결과?.id === 요청.body.id) {
//             응답.send('아이디 중복 입니다')
//         } else {
//             db.collection('login').insertOne({id : 요청.body.id, pw : 요청.body.pw}, function(에러, 결과){
//                 console.log('입력완료');
//                 응답.redirect('/login');
//             });
//         };
//     });
 
//     // db.collection("login").findOne({id : 요청.body.id}, function(error,result){
//     //     if(result) {
//     //         응답.send("중복된 아이디입니다.");
//     //     } else {
//     //         응답.send("사용 가능한 아이디입니다.");
//     //     }
//     // })

// });

/* Logout */
// 로그아웃 페이지
app.get('/logout', function(요청, 응답){
    요청.logout(function (에러) {
        if(에러) { 
            return next(에러); 
        }
        요청.session.destroy(function () {
            응답.cookie("connect.sid", "", { maxAge: 0 });
            응답.redirect("/");
        });
    });
});

// 회원가입 요청
app.get('/test', function(요청, 응답){
    응답.render('test.ejs', { 사용자 : 요청.id})
})

// 회원가입 중복검사
app.post('/test', function(요청, 응답){
    
    // db.collection('login').findOne({id : 요청.body.id}, function(에러, 결과){
    //     console.log('입력완료');
    //     if(결과?.id === 요청.body.id) {
    //         응답.send('아이디 중복 입니다')
    //     } else {
    //         db.collection('login').insertOne({id : 요청.body.id, pw : 요청.body.pw}, function(에러, 결과){
    //             console.log('입력완료');
    //             응답.redirect('/login');
    //         });
    //     };
    // });
 
    db.collection("login").findOne({id : 요청.body.id}, function(에러, 결과){
        if(결과?.id === 요청.body.id) {
            응답.send('중복된 아이디입니다.');
        } else {
            응답.send('사용 가능한 아이디입니다.');
        }
    });
});

// app.use -> 미들웨어 사용
app.use('/shop', require('./routes/shop.js'));

app.use('/board/sub', require('./routes/board.js'));


// 이미지 업로드
let multer = require('multer');
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './public/img')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
    // 파일 제한
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('PNG, JPG만 업로드하세요'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    },
});
const upload = multer({storage : storage});

app.get('/upload', function(요청, 응답){
    응답.render('upload.ejs');
});

// app.post('/upload', upload.single('input의 name속성이름'), function(요청, 응답){
// upload.array('input의 name속성이름', 최대 올릴숫자)
app.post('/upload', upload.array('img', 3), function(요청, 응답){
    응답.send('업로드완료')
});

// 이미지
app.get('/image/:imageName', function(요청, 응답){
    응답.sendFile(__dirname + '/public/image/' + 요청.params.imageName);
});

// 채팅
// app.get('/chat/:id', function(요청, 응답){ // :id -> 문자열입력하면 보여줌
//     요청.params.id = parseInt(요청.params.id); // id를 정수로 변경
    
//     db.collection('post').findOne({_id : 요청.params.id}, function(에러, 결과){ //params중 입력한 id라는 뜻
//         console.log(결과);
        
//         if(응답) {
//             응답.render('chat.ejs', {data : 결과});
//         }
//     });
// });

//
const {ObjectId} = require('mongodb')

app.post('/chat', 로그인했니, function(요청, 응답){
    const 저장 = {
        title : '무슨채팅방',
        member : [ObjectId(요청.body.당한사람id), 요청.user._id],
        date : new Date(),
    };
    db.collection('chatroom').insertOne(저장).then((결과) => {
        응답.send('성공');
    });
});

app.get('/chat', 로그인했니, (요청, 응답) => {
    db.collection('chatroom').find({member : 요청.user._id}).toArray().then((결과) => {
        응답.render('chat.ejs', { data : 결과 });
    });
});

// app.get('/chat', 로그인했니, function(req, res) {
//     db.collection('chatroom').find({member : req.user_id}).toArray().then((결과) => {
//         res.render('chat.ejs', { data : 결과 });
//     });
// })