const chai = require("chai");
const expect = chai.expect;
const supertest = require("supertest");

const app = require("./server");
const baseUrl = "https://reunion-2znh.onrender.com";

describe("API endpoint /api/authenticate", function () {
  it("responds with a JWT cookie and token", function (done) {
    supertest(baseUrl)
      .post("/api/authenticate")
      .send({
        email: "user1@gmail.com",
        password: "12345678",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an("object");
        expect(res.body.token).to.be.a("string");
        expect(res.headers["set-cookie"]).to.be.an("array");
        expect(res.headers["set-cookie"][0]).to.match(/jwt=/);

        // Call done() to signal that the test is complete
        done();
      });
  });
});

describe("API endpoint /api/user", function () {
  // Declare a variable to store the cookie
  let cookie;

  // Run the authentication test first to get the cookie
  before(function (done) {
    supertest(baseUrl)
      .post("/api/authenticate")
      .send({
        email: "user1@gmail.com",
        password: "12345678",
      })
      .end(function (err, res) {
        if (err) return done(err);
        cookie = res.headers["set-cookie"];
        done();
      });
  });

  // Test the /api/user endpoint with the cookie
  it("responds with the user data", function (done) {
    supertest(baseUrl)
      .get("/api/user")
      .set("Cookie", cookie)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an("object");
        expect(res.body.username).to.be.a("string");
        expect(res.body.followers).to.be.a("number");
        expect(res.body.following).to.be.a("number");

        // Call done() to signal that the test is complete
        done();
      });
  });

  // Test the /api/follow endpoint with the cookie
  it("follows another user with id 645a95783f1fbd42a820d71e", function (done) {
    supertest(baseUrl)
      .post("/api/follow/645a95783f1fbd42a820d71e")
      .set("Cookie", cookie)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an("object");
        expect(res.body.result).to.equal("Followed");

        // Call done() to signal that the test is complete
        done();
      });
  });

  // Test the /api/unfollow endpoint with the cookie
  it("unfollows the user with id 645a95783f1fbd42a820d71e", function (done) {
    supertest(baseUrl)
      .post("/api/unfollow/645a95783f1fbd42a820d71e")
      .set("Cookie", cookie)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an("object");
        expect(res.body.result).to.equal("Unfollowed");

        // Call done() to signal that the test is complete
        done();
      });
  });
});

describe("API endpoint /api/posts", function () {
  // Declare a variable to store the cookie
  let cookie;

  // Run the authentication test first to get the cookie
  before(function (done) {
    supertest(baseUrl)
      .post("/api/authenticate")
      .send({
        email: "user1@gmail.com",
        password: "12345678",
      })
      .end(function (err, res) {
        if (err) return done(err);
        cookie = res.headers["set-cookie"];
        done();
      });
  });

  // Test the /api/posts endpoint with the cookie
  it("creates a new post with title and description", function (done) {
    supertest(baseUrl)
      .post("/api/posts")
      .set("Cookie", cookie)
      .send({
        title: "My new Post",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an("object");
        expect(res.body._id).to.be.a("string");
        expect(res.body.title).to.equal("My new Post");
        expect(res.body.description).to.equal(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        );
        expect(res.body.date).to.be.a("string");

        // Call done() to signal that the test is complete
        done();
      });
  });

  it("deletes the post with the specified ID", function (done) {
    // Create a new post to be deleted
    supertest(baseUrl)
      .post("/api/posts")
      .set("Cookie", cookie)
      .send({
        title: "My new Post",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      })
      .end(function (err, res) {
        if (err) return done(err);

        // Store the ID of the new post
        const postId = res.body._id;

        // Send a DELETE request to the API to delete the post
        supertest(baseUrl)
          .delete(`/api/posts/${postId}`)
          .set("Cookie", cookie)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body).to.be.an("object");
            expect(res.body.message).to.equal("Deleted");

            // Call done() to signal that the test is complete
            done();
          });
      });
  });

  it("returns an error message if the post ID is invalid", function (done) {
    // Send a DELETE request with an invalid post ID
    supertest(baseUrl)
      .delete("/api/posts/645ab80e576d3de8b305d0ab")
      .set("Cookie", cookie)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("Post doesnt exist");

        // Call done() to signal that the test is complete
        done();
      });
  });

  it("returns all posts made by the user", function (done) {
    supertest(baseUrl)
      .get("/api/all_posts")
      .set("Cookie", cookie)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an("object");
        expect(res.body.posts).to.be.an("array");
        expect(res.body.posts.length).to.be.at.least(1);

        // Check that each post in the array has the expected properties
        res.body.posts.forEach(function (post) {
          expect(post).to.be.an("object");
          expect(post._id).to.be.a("string");
          expect(post.title).to.be.a("string");
          expect(post.description).to.be.a("string");
          expect(post.date).to.be.a("string");
        });

        // Call done() to signal that the test is complete
        done();
      });
  });
});
