require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");
const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();


app.use(bodyParser.urlencoded({
  extended: true
}));


mongoose.connect("mongodb://localhost:27017/internDB", {useNewUrlParser: true,
useUnifiedTopology: true})


////////////////////////////////
// user
const userSchema = new mongoose.Schema( {
    firstName: String,
    lastName: String,
    email:{
        type: String,
        required: [true, 'you must give an email']
    },
    userName: String,
    password: {
        type: String,
        required: [true, 'you must give a password']
    },
    confirmPassword: {
        type: String,
        required: [true, 'you must give a password']
    } ,
    birthDate: String,
    field: String,
    city: String,
});


const User = new mongoose.model('User', userSchema);

app.route("/users")

.get(function(req, res){
    User.find(function(err, users){
    if (users) {
      const jsonUsers = JSON.stringify(users);
      res.send(jsonUsers);
    } else {
      res.send("No users currently in internDB.");
    }
  });
})

.post(function(req, res){
bcrypt.hash(req.body.password, saltRounds,function(err, hash){
    const newUser = new User({
        firstName: req.body.firstName,
         lastName: req.body.lastName,
         email: req.body.email,
         userName: req.body.userName,
         password: hash,
         confirmPassword: hash,
         birthDate: req.body.birthDate,
         field: req.body.field,
         city: req.body.city,
         courses: req.body.Courses
        });
        newUser.save(function(err){
            if (!err){
                res.send("Successfully added a new user.");
            } else {
                res.send(err);
            }
    
        });
});
})

.delete(function(req, res){

    User.deleteMany(function(err){
    if (!err){
      res.send("Successfully deleted all the users in internDB.");
    } else {
      res.send(err);
    }
  });

});

////////////////////////////////////////////////

app.route("/users/:userName")

.get(function(req, res){
  const userName = req.params.userName;
  User.findOne({userName: userName}, function(err, user){
    if (user){
      const jsonUser = JSON.stringify(user);
      res.send(jsonUser);
    } else {
      res.send("No user with the  userName found.");
    }
  });
})

.patch(function(req, res){
  const userName = req.params.userName;
  User.update(
      {userName:req.params.userName},
      {$set: req.body},
    function(err){
      if (!err){
        res.send("Successfully updated selected user.");
      } else {
        res.send(err);
      }
    });
})

.delete(function(req, res){
  const userName = req.params.userName;
  User.findOneAndDelete({userName: userName}, function(err){
    if (!err){
      res.send("Successfully deleted selected user .");
    } else {
      res.send(err);
    }
  });
});

////////////////////////////////
/// user LogIn
app.route("/userlogin")

.post(function(req,res){
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email:email}, function(err, foundUser){
        if(err){
            res.send('no such user with this email, login again')
        }
        else{
            if(foundUser){
                bcrypt.compare(password, foundUser.password,function(err, result){
                    if(result === true){
                        res.send('user found');
                    }
                    else{
                        res.send('wrong password');
                    }
                });
        }
    }
});
    
});

////////////////////////////////////////
/// courses
const courseSchema = new mongoose.Schema( {
    courseName: String,
    courseLocation: String,
    companyName: String,
    skillsNeeded: String,
    coursePeriod: String,
    vacancies: String,
    requirements: String,
    availableFor: String,
    about: String,
    applicant:[{
        type: mongoose.Schema.Types.userName,
        ref: 'User'
    }] 
});

const Course = new mongoose.model('Course', courseSchema);

app.route("/courses")

.get(function(req, res){
    Course.find(function(err, courses){
    if (courses) {
      const jsonCourses = JSON.stringify(courses);
      res.send(jsonCourses);
    } else {
      res.send("No Courses currently in internDB.");
    }
  });
})

.post(function(req, res){
    const newCourse = new Course({
        courseName: req.body.courseName,
        courseLocation: req.body.courseLocation,
        companyName: req.body.companyName,
        skillsNeeded: req.body.skillsNeeded,
        coursePeriod: req.body.skillsNeeded,
        vacancies: req.body.vacancies,
        requirements: req.body.requirements,
        availableFor: req.body.availableFor,
        about: req.body.about,
        applicant: req.body.applicant
        });
        newCourse.save(function(err){
            if (!err){
                res.send("Successfully added a new course.");
            } else {
                res.send(err);
            }
    
        });
})

.delete(function(req, res){

    Course.deleteMany(function(err){
    if (!err){
      res.send("Successfully deleted all the courses in internDB.");
    } else {
      res.send(err);
    }
  });

});

////////////////////////////////////////////////

app.route("/courses/:courseName")

.get(function(req, res){
  const courseName = req.params.courseName;
  Course.findOne({courseName: courseName}, function(err, course){
    if (course){
      const jsonCourse = JSON.stringify(course);
      res.send(jsonCourse);
    } else {
      res.send("No course with the name found.");
    }
  });
})

.patch(function(req, res){
  const courseName = req.params.courseName;
  Course.update(
      {courseName:req.params.courseName},
      {applicant: req.body.applicant.userName},
    function(err){
      if (!err){
        res.send("Successfully updated selected course.");
      } else {
        res.send(err);
      }
    });
})

.delete(function(req, res){
  const courseName = req.params.courseName;
  Course.findOneAndDelete({courseName: courseName}, function(err){
    if (!err){
      res.send("Successfully deleted selected course .");
    } else {
      res.send(err);
    }
  });
});


///////////////////////////////////////////////
/// company
const companySchema = new mongoose.Schema( {
    companyName: String,
    companyLocation:String,
    companyEmail: {
        type: String,
        required: [true, 'you must give an email']
    },
    password: {
        type: String,
        required: [true, 'you must give a password']
    },
    confirmPassword: {
        type: String,
        required: [true, 'you must give a password']
    },
    companyField: String,
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
});

const Company = new mongoose.model('Company', companySchema);

app.route("/companies")

.get(function(req, res){
    Company.find(function(err, companies){
    if (companies) {
      const jsonCompanies = JSON.stringify(companies);
      res.send(jsonCompanies);
    } else {
      res.send("No Companies currently in internDB.");
    }
  });
})

.post(function(req, res){
bcrypt.hash(req.body.password, saltRounds,function(err, hash){
    const newCompany = new Company({
        companyName: req.body.companyName,
        companyLocation:req.body.companyLocation,
        companyEmail: req.body.companyEmail,
        password: hash,
        confirmPassword: hash,
        companyField: req.body.companyField,
        courses: req.body.courses
        });
        newCompany.save(function(err){
            if (!err){
                res.send("Successfully added a new company.");
            } else {
                res.send(err);
            }
    
        });
});
})

.delete(function(req, res){

    Company.deleteMany(function(err){
    if (!err){
      res.send("Successfully deleted all the companies in internDB.");
    } else {
      res.send(err);
    }
  });

});

////////////////////////////////////////////////

app.route("/companies/:companyEmail")

.get(function(req, res){
  const companyEmail = req.params.companyEmail;
  Company.findOne({companyEmail: companyEmail}, function(err, company){
    if (company){
      const jsonCompany = JSON.stringify(company);
      res.send(jsonCompany);
    } else {
      res.send("No company with the email found.");
    }
  });
})

.patch(function(req, res){
  const companyEmail = req.params.companyEmail;
  Company.update(
      {companyEmail:req.params.companyEmail},
      {$set: req.body},
    function(err){
      if (!err){
        res.send("Successfully updated selected company.");
      } else {
        res.send(err);
      }
    });
})

.delete(function(req, res){
  const companyEmail = req.params.companyEmail;
  Company.findOneAndDelete({companyEmail: companyEmail}, function(err){
    if (!err){
      res.send("Successfully deleted selected company .");
    } else {
      res.send(err);
    }
  });
});

////////////////////////////////
/// company LogIn
app.route("/companyLogin")
.post(function(req,res){
    const companyEmail = req.body.companyEmail;
    const password = req.body.password;

    Company.findOne({companyEmail:companyEmail}, function(err, foundCompany){
        if(err){
            res.send('no such company with this email, login again')
        }
        else{
            if(foundCompany){
                bcrypt.compare(password, foundCompany.password,function(err, result){
                    if(result === true){
                        res.send('company found');
                    }
                    else{
                        res.send('wrong password');
                    }
                });
        }
    }
});    
});



////////////////////////////
app.listen(3000, function() {
  console.log("Server started on port 3000");
});