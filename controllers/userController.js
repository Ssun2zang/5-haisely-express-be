// CHECKLIST
// [ ] 쿠키 세션 구현
// [ ] status 찍고 다니기
// [ ] userId -> user_id로 바꾸기
// [ ] 로그인 실패 구현

const {loadData, saveData} = require ('./controllerUtils.js');

const userDataPath = 'public/data/users.json';
const keyDataPath = 'public/data/keys.json';
const boardDataPath = 'public/data/boards.json';
const commentDataPath = 'public/data/comments.json';

const cookieConfig = {
    httpOnly: true, 
    maxAge: 1000000,
    signed: true 
};

function verifyToken(req, res, next) {
    const cookieHeader = req.headers['cookie'];

    if (typeof cookieHeader !== 'undefined') {
        // 쿠키 확인
    } else {
        res.redirect('/login');
    }

    // return {"userId" : 1, "nickname":}
}

const login = (req, res) => {
    const requestData = req.body;
    if(!requestData.email || !requestData.password){
        console.log("데이터 미포함 요청");
        jsonData = {
            "status" : 400, "message" : "invalid", "data" :null
        }
        res.json(jsonData);
        return;
    }
    const userData = loadData(userDataPath);
    const user = userData["users"].find(user => user.email === requestData.email);
    if (user === undefined){
        jsonData = {
            "status" : 400, "message" : "invalid", "data" :null
        }
        res.json(jsonData);
        return;
    } else if (user.password !== requestData.password){
        jsonData = {
            "status" : 400, "message" : "invalid", "data" :null
        }
        res.json(jsonData);
        return;
    }
    // 쿠키 주는 코드로 수정하기
    token = "I am not cookie";

    data = {
        "user_id": user.user_id,
        "email": user.email,
        "nickname": user.nickname,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "deleted_at": user.deleted_at,
        "auth_token": token
    }

    jsonData = {
        "status" : 200, "message" : "login_success", "data" : {"user" : data}
    }
    res.json(jsonData);
}

const signUp = (req, res) => {
    const requestData = req.body;
    if(!requestData.email || !requestData.password || !requestData.nickname){
        console.log("데이터 미포함 요청");
        jsonData = {
            "status" : 400, "message" : "invalid", "data" :null
        }
        res.json(jsonData);
        return;
    }
    let userData = loadData(userDataPath);
    let keyData = loadData(keyDataPath);

    userId = keyData.user_id + 1;

    const now = new Date();
    const localTimeString = now.toLocaleString();

    newUser = {
        "user_id": userId,
        "email": requestData.email,
        "nickname": requestData.nickname,
        "password": requestData.password,
        "profile_image": requestData.profileImagePath || "/images/default.png",
        "created_at": localTimeString,
        "updated_at": localTimeString
    }

    userData.users.push(newUser);
    saveData(userData, userDataPath);

    keyData.user_id += 1;
    saveData(keyData, keyDataPath);

    jsonData = {
        "status" : 201, "message" : "register_success", "data" : null
    }
    res.json(jsonData);
}

const logout = (req, res) => {
    // const userData = loadData(userDataPath);
    // 로그아웃 처리
    jsonData = {
        "status" : 200, "message" : null, "data" : null
    }
    
    // 로그아웃 후 로그인 페이지로 리디렉션
    res.redirect('/login');
    
    // 로그아웃 응답
    res.json(jsonData);
}

const getUserId = (req, res) => {
    const userData = loadData(userDataPath);
    const userId = req.params.id;
    let user = userData["users"].find(user => user.user_id === parseInt(userId));

    delete user.password;

    jsonData = {
        "status" : 200, "message" : null, "data" : {"user" : user}
    }
    res.json(jsonData);
}

const patchUser = (req, res) => {
    const requestData = req.body;
    if(!requestData.nickname){
        console.log("데이터 미포함 요청");
        jsonData = {
            "status" : 400, "message" : "invalid", "data" :null
        }
        res.json(jsonData);
        return;
    }

    const userData = loadData(userDataPath);
    const userId = req.params.id;
    const userIndex = userData["users"].findIndex(user => user.user_id === parseInt(userId));
    
    const now = new Date();
    const localTimeString = now.toLocaleString();

    userData["users"][userIndex].nickname = requestData.nickname;
    userData["users"][userIndex].profile_image = requestData.profileImage || "/images/default.png";
    userData["users"][userIndex].updated_at = localTimeString;

    saveData(userData, userDataPath);

    jsonData = {
        "status" : 200, "message" : "update_user_data_success", "data" : null
    }
    res.json(jsonData);
}

const patchPassword = (req, res) => {
    const requestData = req.body;
    if(!requestData.password){
        console.log("데이터 미포함 요청");
        jsonData = {
            "status" : 400, "message" : "invalid", "data" :null
        }
        res.json(jsonData);
        return;
    }

    const userData = loadData(userDataPath);
    const userId = req.params.id;
    const userIndex = userData["users"].findIndex(user => user.user_id === parseInt(userId));
    
    const now = new Date();
    const localTimeString = now.toLocaleString();

    userData["users"][userIndex].password = requestData.password;
    userData["users"][userIndex].updated_at = localTimeString;

    saveData(userData, userDataPath);

    jsonData = {
        "status" : 200, "message" : "update_user_password_success", "data" : null
    }
    res.json(jsonData);
}

const deleteUser = (req, res) => {
    const userData = loadData(userDataPath);
    const userId = req.params.id;
    const userIndex = userData["users"].findIndex(user => user.user_id === parseInt(userId));
    const removedItem = userData["users"].splice(userIndex, 1);
    saveData(userData, userDataPath);

    // post 삭제, comment 삭제
    let boardData = loadData(boardDataPath);
    let commentData = loadData(commentDataPath);
    const boards = boardData["boards"].filter(item => item.user_id === parseInt(userId));

    // 게시글에 연관된 댓글 삭제
    boards.forEach(board => {
        let boardId = board.post_id;
        // console.log("board_id : ", boardId);
        const boardIndex = boardData["boards"].findIndex(item => item.post_id === board.post_id);
        // console.log("board_index : ", boardIndex);

        boardData["boards"].splice(boardIndex, 1);

        const comments = commentData["comments"].filter(item => item.post_id === parseInt(boardId));
        // 게시글에 연관된 댓글 삭제
        comments.forEach(comment => {
            // console.log("1) comment_id : ", comment.comment_id);
        const commentIndex = commentData["comments"].findIndex(item => item.comment_id === comment.comment_id);
        commentData["comments"].splice(commentIndex, 1);
        });
    });

    const comments = commentData["comments"].filter(item => item.user_id === parseInt(userId));
    // 게시글에 연관된 댓글 삭제
    comments.forEach(comment => {
        // console.log("2) comment_id : ", comment.comment_id);
        const commentIndex = commentData["comments"].findIndex(item => item.comment_id === comment.comment_id);
        commentData["comments"].splice(commentIndex, 1);
    });

    saveData(boardData, boardDataPath);
    saveData(commentData, commentDataPath);

    jsonData = {
        "status" : 200, "message" : "delete_user_data_success", "data" : null
    }
    res.json(jsonData);
}

const authCheck = (req, res) => {
    // 쿠키가 유효하다면, 세션 정보 넘겨주기
    const userData = loadData(userDataPath);
    user = userData["users"].find(user => user.user_id === 1);

    const userJson =  {
        "user_id": user.user_id,
        "email" : user.email,
        "nickname" : user.nickname,
        "profile_image": user.profile_image,
        "auth_token": "I am not cookie",
        "auth_status" : true
    }

    jsonData = {
        "status" : 200, "message" : null, "data" : {"user":userJson}
    }
    res.json(jsonData);
}

const emailCheck = (req, res) => {
    const userData = loadData(userDataPath);
    const {email} = req.query;
    const user = userData["users"].find(user => user.email === email);
    console.log(user);
    if (user !== undefined){
        jsonData = {
            "status" : 400, "message" : "already_exist_email", "data" :null
        }
        res.json(jsonData);
        return;
    }
    console.log(user);
    jsonData = {
        "status" : 200, "message" : "available_email", "data" : null
    }
    res.json(jsonData);
}

const nicknameCheck =  (req, res) => {
    const userData = loadData(userDataPath);
    const {nickname} = req.query;
    const user = userData["users"].find(user => user.nickname === nickname);
    if (user !== undefined){
        jsonData = {
            "status" : 400, "message" : "already_exist_nickname", "data" :null
        }
        res.json(jsonData);
        return;
    }
    console.log(user);
    jsonData = {
        "status" : 200, "message" : "available_nickname", "data" : null
    }
    res.json(jsonData);
}

module.exports ={
    login,
    signUp,
    logout,
    getUserId,
    patchUser,
    patchPassword,
    deleteUser,
    authCheck,
    emailCheck,
    nicknameCheck
}