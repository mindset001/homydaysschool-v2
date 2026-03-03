import { IProfile } from "../types/user.type";
import Phone from "../components/svg/Phone";
import Message from "../components/svg/Message";
import { convertToNormalWords } from "../utils/regex";
import { useEffect, useState, useRef } from "react";
import { getRole } from "../utils/authTokens";
import { useDeleteStaff, useEditStaff } from "../services/api/staffApis";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "./Loader";
import useClasses from "../hooks/useClasses";
import { showErrorToast, showSuccessToast } from "./ToastNotification";
import { profileImage } from "../assets/images/users";

interface IUserDetailsProps {
  user: IProfile;
}

const UserDetails = ({ user }: IUserDetailsProps) => {
  const queryClient = useQueryClient();
  const { mutate, isPending: isEditingUser } = useEditStaff();
  const { mutate: deleteMutate, isPending: isDeletingUser } = useDeleteStaff();
  const { classNameData, isClassLoading } = useClasses();

  const [classes, setClasses] = useState<{ id: string | number; name: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File>();
  const [editableUser, setEditableUser] = useState(user);
  const imageInputRef = useRef<HTMLInputElement | null>(null); // Ref for file input
  const [editedAssignedTo, setEditedAssignedTo] = useState(false);

  useEffect(() => {
    setEditableUser(user);
    if (classNameData) {
      classNameData.map((data) => {
        setClasses((prevCLassesData) => [
          ...prevCLassesData,
          { id: data.id, name: data.name },
        ]);
      });
    }
  }, [user, classNameData]);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };
  console.log("classes are:-", classes);

  const handleInputChange = (e: {
    target: { name: string; value: string | number };
  }) => {
    const { name, value } = e.target;
    setEditableUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditableUser((prevUser) => ({
        ...prevUser,
        image: URL.createObjectURL(file), // Temporarily display the image
      }));
      setImageFile(file); // Store the file to send during form submission
    }
  };

  const saveChanges = () => {
    const formData = new FormData();

    // Append the new image file if it exists
    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (editedAssignedTo) {
      formData.append(
        "assigned_to",
        editableUser["assigned_to" as keyof IProfile] as string
      );
    }
    // Append all fields except imageFile
    Object.keys(editableUser).forEach((key) => {
      if (key !== "image" && key !== "assigned_to") {
        formData.append(key, editableUser[key as keyof IProfile] as string);
      }
    });

    mutate(
      { id: editableUser.id as number, updateData: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["staffs"] });
          // alert("Updated staff successfully!!!");
          showSuccessToast("Updated staff successfully!");
        },
        onError: (error: Error) => {
          // alert("Error updating staff");
          showErrorToast(`Error updating staff ${error.message}`);
          console.error("can't update staff:", error);
        },
      }
    );

    toggleEditing();
  };

  const deleteStaff = () => {
    deleteMutate(editableUser.id as number, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["staffs"] });
        showSuccessToast("Deleted staff successfully!");
        // alert("Deleted staff successfully!!!");
      },
      onError: (error: Error) => {
        // alert("Error delete staff");
        showErrorToast(`can't delete staff: ${error.message}`);
        console.error("can't delete staff:", error);
      },
    });

    toggleEditing();
  };

  return (
    <>
      {isEditingUser || isClassLoading || isDeletingUser ? (
        <Loader />
      ) : (
        <>
          <div className="staff-img-container">
            <img
              src={editableUser.image || profileImage}
              onError={(e) =>
                (e.currentTarget.src = profileImage)
              }
              alt={editableUser.first_name}
              className="staff-img"
            />
          </div>

          <div className="ml:w-[300px] ml:m-auto">
            <h1 className="staff-name">
              {editableUser.first_name} {editableUser.last_name}
            </h1>
            <h3 className="staff-subject-font">{editableUser.subject}</h3>

            <span className="flex item-center lg:justify-center ml:justify-between ml:px-[20px] gap-[20px] mx-[20px] my-2">
              <a href={`tel:+${editableUser.phone_number}`} className="contact">
                <Phone />
              </a>
              <a href={`mailto:${editableUser.email}`} className="contact">
                <Message />
              </a>
            </span>
          </div>

          <div className="py-0 px-1">
            <div className="flex flex-col gap-1 sm:gap-1">
              {isEditing && (
                <div className="flex w-full">
                  <label className="text-[13px] min-w-fit mr-5 sm:text-[15px] font-Lora font-bold">
                    Select an image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={handleImageChange} // Handle image selection
                    className="image-input"
                  />
                </div>
              )}
              {Object.entries(editableUser).map((prop, index) => {
                const dateField =
                  prop[0] === "date_of_birth" && editableUser.date_of_birth;
                const formattedDate = dateField
                  ? new Date(dateField).toISOString().split("T")[0]
                  : ""; // Convert to YYYY-MM-DD format

                return (
                  prop[0] !== "image" &&
                  prop[0] !== "id" && (
                    <div
                      key={index}
                      className="flex justify-between items-center w-[100%]"
                    >
                      <p className="text-[13px] sm:text-[15px] font-Lora font-bold">
                        {convertToNormalWords(prop[0])}
                      </p>
                      {isEditing && prop[0] === "assigned_to" && (
                        <select
                          name={prop[0]}
                          value={prop[1]}
                          className="w-4/6 h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
                          onChange={(e) => {
                            setEditedAssignedTo(true);
                            handleInputChange(e);
                          }}
                        >
                          <option value="">Select class</option>
                          {classes.length &&
                            classes.map((classItem, index) => (
                              <option key={index} value={classItem.id.toString()}>
                                {classItem.name}
                              </option>
                            ))}
                        </select>
                      )}
                      {isEditing &&
                      prop[0] !== "age" &&
                      prop[0] !== "assigned_to" ? (
                        prop[0] === "date_of_birth" ? (
                          <input
                            type="date"
                            name={prop[0]}
                            value={formattedDate}
                            onChange={handleInputChange}
                            className="staff-details-input hdmInput"
                          />
                        ) : (
                          <input
                            type="text"
                            name={prop[0]}
                            value={prop[1]}
                            disabled={prop[0] === "class_name"}
                            onChange={handleInputChange}
                            className={`staff-details-input hdmInput ${prop[0] === "class_name" && "cursor-not-allowed"}`}
                          />
                        )
                      ) : prop[0] === "date_of_birth" ? (
                        <p className="staff-details-font">
                          {new Date(prop[1]).toLocaleDateString("en-GB")}
                        </p>
                      ) : (
                        <p className="staff-details-font">{prop[1]}</p>
                      )}
                    </div>
                  )
                );
              })}
            </div>
          </div>
          {getRole() === "admin" && (
            <div className="action mt-2">
              {isEditing ? (
                <>
                  <button className="edit-btn mr-2" onClick={saveChanges}>
                    Save
                  </button>
                  <button
                    className="edit-btn bg-red-600"
                    onClick={toggleEditing}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="edit-btn mr-2" onClick={toggleEditing}>
                    Edit
                  </button>
                  <button className="edit-btn bg-red-600" onClick={deleteStaff}>
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default UserDetails;
