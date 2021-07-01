import { users } from '../../users'

export default (req, res) => {
  if (req.method === "POST") {
    const user = req.body;
    users.push(user)
    res.socket['userId'] = user
    res?.socket?.server?.io?.emit("users", users);
    res.status(201).json(user);
  }
  console.log(req.method)

};
