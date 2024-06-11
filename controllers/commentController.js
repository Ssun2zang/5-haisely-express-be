// CHECKLIST
// [x] 인증 인가

const {loadData, saveData, makeRes, getTimeNow} = require ('./controllerUtils.js');
const {findCommentsByCommentId, saveNewComment, patchCommentContent, deleteCommentById} = require('../models/Comments.js')

/* Controller */
const postComment = (req, res) =>{
    const requestData = req.body;
    const postId = req.params.id;
    if(!requestData.commentContent){res.status(400).json(makeRes(400, "invalid_comment_content", null)); return;} // invalid content
    const boardData = loadData(boardDataPath);
    const board = boardData["boards"].find(board => board.post_id === parseInt(postId));
    if (!board) {res.status(404).json(makeRes(404, "cannot_found_post", null)); return;}  // board not found
    // const user = req.session.user
    const user = {user_id: 1};
    const commentId = saveNewComment(newComment);
    res.status(201).json(makeRes(201, "write_comment_success", {"comment_id" : commentId}));
}

const patchComment = (req, res) =>{
    const requestData = req.body;
    const commentId = req.params.commentId;
    if(!requestData.commentContent){res.status(400).json(makeRes(400, "invalid_comment_content", null)); return;} // invalid content
    const comment = findCommentsByCommentId(commentId);
    if(!comment) {res.status(404).json(makeRes(404, "cannot_found_comment", null)); return;}  // comment not found
    patchCommentContent(comment, requestData.commentContent);
    res.status(200).json(makeRes(200, "update_comment_success", {"comment_id" : commentId}));
}

const deleteComment = (req, res) =>{
    const commentId = req.params.commentId;
    const comment = findCommentsByCommentId(commentId);
    if (!comment) {res.status(404).json(makeRes(404, "cannot_found_comment", null)); return;}  // comment not found
    deleteCommentById(commentId);
    res.status(200).json(makeRes(204, "delete_post_success", null));
}

module.exports = {
    postComment,
    patchComment,
    deleteComment,
}