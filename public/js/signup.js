// 아이디 유효성 검사
$('.user_id').focusout(function(){
    const userId = $('.user_id').val();
    const idCheck = /^[a-z0-9]{4,12}$/;
    
    if(userId === '') {
        $('.text_id').text('아이디를 입력바랍니다');
        $('.text_id').css('color', 'red');
        return false;
    } else if(!idCheck.test(userId)) {
        $('.text_id').text('4~12자 영문 소문자, 숫자를 사용하세요');
        $('.text_id').css('color', 'red');
        return false;
    } else {
        $('.text_id').text('아이디 사용가능');
        $('.text_id').css('color', 'green');
        return true;
    };
});

// 비밀번호 유효성 검사
$('.user_pw').focusout(function(){
    const userId = $('.user_id').val();
    const userPw = $('.user_pw').val();
    const number = userPw.search(/[0-9]/g);
    const english = userPw.search(/[a-z]/ig);
    const spece = userPw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);
    const pwCheck = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/;

    if(userPw === '') {
        $('.text_pw').text('비밀번호를 입력바랍니다');
        $('.text_pw').css('color', 'red');
        return false;
    } else if(!pwCheck.test(userPw)) {
        $('.text_pw').text('8~16자 영문 대 소문자, 숫자, 특수문자를 혼합하여 사용하세요.');
        $('.text_pw').css('color', 'red');
        return false;
    } else if(/(\w)\1\1/.test(userPw)){
        $('.text_pw').text('같은 문자를 3번 이상 사용하실 수 없습니다.');
        $('.text_pw').css('color', 'red');
        return false;
    } else if(userPw.search(userId) > -1){
        $('.text_pw').text('비밀번호에 아이디가 포함되었습니다.');
        $('.text_pw').css('color', 'red');
        return false;
    } else {
        $('.text_pw').text('비밀번호 사용가능');
        $('.text_pw').css('color', 'green');
        return true;
    };
});

// 비밀번호 재확인 유효성 검사
$('.user_rpw').focusout(function(){
    const userPw = $('.user_pw').val();
    const userRPw = $(".user_rpw").val();
    
    if(userPw !== userRPw) {
        $('.text_rpw').text('비밀번호가 일치하지 않습니다.'); 
        $('.text_rpw').css('color', 'red');
        return false;
    } else {
        $('.text_rpw').text('비밀번호가 일치합니다.');
        $('.text_rpw').css('color', 'green');
        return true;
    };
});

// 닉네임 유효성 검사
$('.user_nickname').focusout(function(){
    const userNickname = $(".user_nickname").val();
    const nicknameCheck = /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,8}$/;

    if(userNickname === '') {
        $('.user_nickname').text('닉네임를 입력바랍니다');
        $('.user_nickname').css('color', 'red');
        return false;
    } else if(!nicknameCheck.test(userNickname)) {
        $('.text_nickname').text('2~8자 한글과 영문 소문자, 숫자를 사용하세요 (특수기호, 공백 사용 불가)');
        $('.text_nickname').css('color', 'red');
        return false;
    } else {
        $('.text_nickname').text('닉네임 사용가능');
        $('.text_nickname').css('color', 'green');
        return true;
    };
});