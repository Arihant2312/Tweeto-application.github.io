const express=require("express");
const cookieParser=require("cookie-parser")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const postmodel=require("./models/post")
const app = express();
const usermodel=require("./models/user");
const post = require("./models/post");
app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({ extended:true}))
app.use(cookieParser())

app.get("/",(req, res) => {
    res.render("index")});
app.post("/register",async(req, res) => {
    let{name,username,password,email,age} = req.body
    const user=await usermodel.findOne({email:email})
    if(!user)
    {
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(password,salt,async(err,hash)=>{
                let user=await usermodel.create({
                    name,
                    username,
                    email,
                    password:hash,
                    age
                });
                let token=jwt.sign({email:email,userid:user._id},"hello")
                res.cookie("token",token)
                res.status(200).redirect("/login")
            })
    
        })
     
        
    }

    else if(user){
        console.log(user);
        
        
        return res.status(200).send("user already registered")

    }
   

})
app.get("/profile",isLoggedIn, async(req,res)=>{
    const user=await usermodel.findOne({email:req.user.email}).populate("posts")
    console.log(user,{user});
  

    
    res.render("profile",{user})
})
app.post("/post",isLoggedIn, async(req,res)=>{
    const user=await usermodel.findOne({email:req.user.email})
    let post=await postmodel.create({
        user:user._id,
        content:req.body.content,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile')
   
})
app.get("/login",(req, res) => {
    res.render("login")});
    app.post("/login", async (req, res) => {
        const { email, password } = req.body;
    
        try {
            // Check if the user exists
            const user = await usermodel.findOne({ email });
            if (!user) {
                return res.status(404).send("User not found");
            }
    
            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                
                let token=jwt.sign({email:email,userid:user._id},"hello")
                res.cookie("token",token)
                return res.status(200).redirect ("/profile");
            } else {
                return res.status(401).redirect("/login"); // Redirect for incorrect password
            }
        } catch (error) {
            console.error("Error during login:", error.message);
            res.status(500).send("An error occurred during login");
            res.redirect("/register")
        }
    });
    app.get("/logout",(req,res)=>{
        res.cookie("token","");
        res.redirect("/login")
    })
    function isLoggedIn(req, res, next) {
        if (!req.cookies.token) {
            res.locals.message = "You must be logged in";  // Store message in locals to pass to the view
            return res.redirect("/login");
        } else {
            let data = jwt.verify(req.cookies.token, "hello");
            req.user = data;
            next();
        }
    }
    
    app.get("/likes/:id", isLoggedIn, async (req, res) => {
        try {
            let post = await postmodel.findOne({ _id: req.params.id });
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }
    
            const userIndex = post.likes.indexOf(req.user.userid);
            let liked = false;
    
            if (userIndex === -1) {
                // Add like
                post.likes.push(req.user.userid);
                liked = true;
            } else {
                // Remove like
                post.likes.splice(userIndex, 1);
            }
    
            await post.save();
    
            res.status(200).redirect("/profile");
            
        } catch (error) {
            console.error("Error handling likes:", error);
            res.status(500).json({ error: "An error occurred" });
        }
    });
    app.get("/edit/:id",isLoggedIn,async(req, res) => {
        let post =await postmodel.findOne({ _id: req.params.id}).populate("user");
        res.render("edit",{post});
    })
    app.post("/update/:id",isLoggedIn,async(req, res) => {
        let post = await postmodel.findOneAndUpdate({ _id: req.params.id},{content:req.body.content});
        res.redirect("/profile")
    })

    
    
   
       
       
    

    


app.listen(8080,() => {console.log("server started")});
