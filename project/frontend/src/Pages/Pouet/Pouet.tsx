import {useState} from "react";
import ApiClient from "../../utils/ApiClient";

export default function Pouet() {
    const [file, setFile] = useState<File | undefined>(undefined);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return ;
        const data = new FormData();
        data.append('avatar', file);
        try {
            await ApiClient.post('/users/upload', data);
        } catch(e) {
            console.error('Error while submitting avatar: ', e);
        }
    }

    function handleInputFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return ;
        setFile(e.target.files[0]);
    }

    return (
        <div>
            <form onSubmit={handleSubmit} encType='multipart/form-data'>
                <input type="file" name="avatar" onChange={handleInputFileChange} />
                <button disabled={file ? false : true} >Submit</button>
            </form>
        </div>
    );
}
