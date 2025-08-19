import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

/*
  /*
    The reason why the doctor data is not being added to MongoDB Atlas could be due to a mismatch or issue between the frontend (AddDoctor.jsx) and the backend API.

    Here are some possible causes and solutions based on the provided code:

    1. **Password Length**: The backend requires the password to be at least 8 characters long. If you submit a password shorter than this, the backend will reject the request.

    2. **Image Upload**: The backend expects the image to be uploaded as a file (multipart/form-data, field name "image"). Make sure the frontend is sending the image file correctly as "image" in FormData.

    3. **Required Fields**: The backend checks for all required fields: name, email, password, speciality, degree, experience, about, fees, address, and image. If any are missing, the request will fail.

    4. **Email Uniqueness**: If you try to add a doctor with an email that already exists in the database, the backend will return a 409 error.

    5. **Token Header**: The backend expects the authentication token in the "aToken" header, formatted as "Bearer <token>". Make sure the frontend sends this header correctly.

    6. **Address Format**: The backend expects the address as a JSON string or object. The frontend is sending it as a JSON string, which is correct.

    7. **API Endpoint**: The frontend is posting to `/api/admin/add-doctor`, which matches the backend route.

    8. **Backend Connection**: The backend is correctly connected to MongoDB Atlas and Cloudinary.

    **How to fix:**
    - Double-check that all required fields are filled in the form.
    - Ensure the password is at least 8 characters.
    - Make sure the image is selected and uploaded as a file.
    - Check the browser network tab for the request and response. If you see a 400/409 error, read the error message for details.
    - Make sure the authentication token is present and valid in the request headers.
    - If you get a success response but data is not in MongoDB, check backend logs for errors.

    **Summary:**  
    The most common reasons for failure are missing/invalid fields, short password, duplicate email, or missing/invalid token.  
    If all these are correct and you still have issues, check the backend logs for more details.
  */


const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { backendUrl, aToken } = useContext(AdminContext);
const onSubmitHandler = async (event) => {
  event.preventDefault();

  try {
    if (!docImg) {
      return toast.error("Image Not Selected");
    }

    if (!name || !email || !password || !experience || !fees || !about || !speciality || !degree || !address1) {
      toast.error("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("image", docImg);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("experience", experience);
    formData.append("fees", Number(fees));
    formData.append("about", about);
    formData.append("speciality", speciality);
    formData.append("degree", degree);
    formData.append("address", JSON.stringify({ 
      addressLine: address1, 
      addressLine2: address2 || "" 
    }));

    const { data } = await axios.post(
      backendUrl + "/api/admin/add-doctor",
      formData,
      { 
        headers: { 
          aToken: `Bearer ${aToken}`,
          "Content-Type": "multipart/form-data"
        } 
      }
    );

    if (data.success) {
      toast.success(data.message);
      setDocImg(false);
      setName("");
      setEmail("");
      setPassword("");
      setExperience("1 year");
      setFees("");
      setAbout("");
      setSpeciality("General physician");
      setDegree("");
      setAddress1("");
      setAddress2("");
    } else {
      toast.error(data.message || "Failed to add doctor");
      console.log(error)
    }
  } catch (error) {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("An error occurred while adding the doctor.");
    }
    console.error("Add doctor error:", error);
  }
};


  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>

      <div className="bg-white px-8 py-8 border-none rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt=""
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
            accept="image/*"
          />

          <p>
            Upload doctor <br /> picture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-20 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="border border-gray-300 rounded px-3 py-2"
                type="text"
                placeholder="Name"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border border-gray-300 rounded px-3 py-2"
                type="email"
                placeholder="Email"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border border-gray-300 rounded px-3 py-2"
                type="password"
                placeholder="Password"
                required
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Experience</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="1 year">1 Year</option>
                <option value="2 year">2 Year</option>
                <option value="3 year">3 Year</option>
                <option value="4 year">4 Year</option>
                <option value="5 year">5 Year</option>
                <option value="6 year">6 Year</option>
                <option value="7 year">7 Year</option>
                <option value="8 year">8 Year</option>
                <option value="9 year">9 Year</option>
                <option value="10 year">10 Year</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Fees</p>
              <input
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                className="border border-gray-300 rounded px-3 py-2"
                type="number"
                placeholder="fees"
                required
                min="0"
              />
            </div>
          </div>
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Speciality</p>
              <select
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                className="border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>Education</p>
              <input
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                className="border border-gray-300 rounded px-3 py-2"
                type="text"
                placeholder="Education"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Address</p>
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                className="border border-gray-300 rounded px-3 py-2"
                type="text"
                placeholder="Address 1"
                required
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                className="border border-gray-300 rounded px-3 py-2"
                type="text"
                placeholder="Address 2"
              />
            </div>
          </div>
        </div>
        <div>
          <p className="mt-4 mb-2">About Doctor</p>
          <textarea
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            className="w-full px-4 pt-2 border border-gray-300 rounded"
            placeholder="write about doctor"
            rows={5}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary px-10 py-3 mt-4 text-white rounded-full"
        >
          Add doctor
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
