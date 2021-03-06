import React, {Component} from 'react';
import axios from 'axios';
// import {Link} from 'react-router-dom';

class SubmissionsCard extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            name: "",
            usn: "",
            fileName: "",
        });
    }

    componentDidMount() {
        let token = localStorage.getItem('token');
        let self = this;
        // /api/account/:userID/details
        axios.get(`/api/account/${this.props.user}/details`, {
            headers: {
                'x-access-token': token
            }
        })
            .then((res) => {
                // console.log(self.props.user, res);
                this.setState({
                    name: res.data.user.name.firstName,
                    usn: res.data.user.usn
                });
            })
            .catch((err) => console.log(err));

        // /api/file/:fileID/details
        axios.get(`/api/file/${this.props.fileID}/details`, {
            headers: {
                'x-access-token': token
            }
        })
            .then((res) => {
                console.log(self.props.fileID, res);
                this.setState({
                    fileName: res.data.data.file.filename
                });
            })
            .catch((err) => console.log(err));
    }

    render() {
        let content;
        const Content = (
            <div id="SubmissionsCard">
                <div className="card bg-light mx-auto">

                    <div className="card-body text-left">
                        Name : {this.state.name}<br />
                        USN : {this.state.usn}<br />
                        File Name : {this.state.fileName} <br /><br />
                        <button className="btn btn-dark" onClick={()=>window.open('/download/'+this.props.fileID)}> Download Submission </button>
                    </div>

                </div>
                <br />
            </div>
        );
        content = Content;
        return (
            <div>{content}</div>

        );
    }
}
export default SubmissionsCard;
