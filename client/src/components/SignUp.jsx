import React, { Component } from 'react'
// import $ from 'jquery'
import serialize from 'form-serialize'
export default class SignUp extends Component {
    handleSubmit = (e) => {
        e.preventDefault()
        let formRegis = document.querySelector('#regisUser')
        let formData = serialize(formRegis, { hash: true })
        console.log(formData)
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="animated fadeIn">
                    <div className="card">
                    <div className="card-header"></div>
                    <div className="card-body">
                        <cite>Build forms in React, without the tears</cite> with{" "}
                        <cite>Dead simple Object schema validation</cite>
                        <hr />
                        <div className="row">
                            <div className="col-lg-6">
                                <form noValidate name="simpleForm" id='regisUser'>
                                    <div className="position-relative form-group">
                                        <label htmlFor="fullName"> Name
                                        </label>
                                        <input name="fullName"
                                            id="fullName"
                                            placeholder="Full Name"
                                            required
                                            type="text"
                                            className="form-control" />
                                        <div className="invalid-feedback" />
                                    </div>
                                    <div className="position-relative form-group">
                                        <label htmlFor="located"> Located </label>
                                        <input name="located"
                                            id="located"
                                            placeholder="Located"
                                            required
                                            type="text"
                                            className="form-control"
                                            />
                                        <div className="invalid-feedback">Located is required</div>
                                    </div>
                                    <div className="position-relative form-group">
                                        <label htmlFor="email">
                                        Email
                                        </label>
                                        <input name="email" id="email" placeholder="Email"
                                            autoComplete="email" required type="email" className="form-control" />
                                        <div className="invalid-feedback">Email is required!</div>
                                    </div>
                                    <div className="position-relative form-group">
                                        <label htmlFor="email" >
                                        ID Card Number
                                        </label>
                                        <input name="idNumber" id="idNumber" placeholder="ID Number"
                                            minLength='9' required className="form-control" />
                                        <div className="invalid-feedback">ID Card Number is required!</div>
                                    </div>
                                    <div className="position-relative form-group">
                                        <label htmlFor="email" >
                                        Phone Number
                                        </label>
                                        <input name="phoneNumber" id="phoneNumber" placeholder="Phone Number"
                                            minLength='9' required className="form-control" />
                                        <div className="invalid-feedback">Phone number is required!</div>
                                    </div>
                                    <div className="position-relative form-group">
                                        <div>
                                            <label htmlFor="email">
                                                Password
                                            </label>
                                            <input name="password" id="password"
                                                required type="password" className="form-control" />
                                        </div>
                                        <div>
                                            <label htmlFor="email">
                                                Re-Password
                                            </label>
                                            <input name="rePassword" id="rePpassword"
                                                required type="password" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="position-relative form-group">
                                        <button type="submit" className="mr-1 btn btn-primary"
                                            onClick={this.handleSubmit}>
                                            Submit
                                        </button>
                                        <button type="reset" className="mr-1 btn btn-danger">
                                            Reset
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="col-lg-6">
                                <div className="bg-secondary card">
                                    Terms of conditions
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}