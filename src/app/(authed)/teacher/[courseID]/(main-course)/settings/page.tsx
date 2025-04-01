"use client";

import {
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
  DragEvent,
  useEffect,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styles from "./create.module.css";
import { useSession } from "@/providers/SessionProvider";
import { Course, CourseCreate } from "../../../services/teacherService";
import { useCreateCourse } from "@/hooks/useCourseQueries";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import DialogComp from "@/components/DialogComp";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/libs/api";

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, signOut } = useSession();
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createCourseMutation, isPending } = useCreateCourse();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { courseID } = useParams();
  const queryClient = useQueryClient();

  const { data: course } = useQuery({
    queryKey: ["user-course", courseID],
    queryFn: async () => {
      const res = await api.get<Course>(`/v1/courses/${courseID}`);
      return res.data;
    },
  });

  const updateCourse = useMutation({
    mutationFn: async () => {
      await api.patch(`/v1/courses/${courseID}`, {
        name: name,
        coverImage: imageURL,
        description: description,
      });
    },
    onSuccess: () => {},
  });

  const deleteCourse = useMutation({
    mutationFn: async () => {
      await api.delete(`/v1/courses/${courseID}`);
    },
  });

  const handleUpdate = async () => {
    if (name.trim() === "" || imagePreview === "" || description === "") {
      toast.error("Data can not be empty!");
    }
    // else if (
    //   (name === course?.name && imagePreview === course?.coverImage) ||
    //   description === course?.description
    // ) {
    //   toast.warning("Data didn't change");
    // }
    else {
      toast.promise(updateCourse.mutateAsync, {
        loading: "Updating",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["user-course"],
            refetchType: "all",
          });
          queryClient.invalidateQueries({
            queryKey: ["course"],
            refetchType: "all",
          });
          queryClient.invalidateQueries({
            queryKey: ["courses"],
            refetchType: "all",
          });
          queryClient.invalidateQueries({
            queryKey: ["teacher"],
            refetchType: "all",
          });
          return "This course have been updated.";
        },
      });
    }
  };

  const handleDelete = async () => {
    await deleteCourse.mutateAsync();
    queryClient.invalidateQueries({
      queryKey: ["user-course"],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["course"],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["courses"],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["teacher"],
      refetchType: "all",
    });
    router.push("/teacher");
  };

  useEffect(() => {
    console.log("called");
    if (course === undefined) return;
    setName(course.name);
    setImagePreview(course.coverImage);
    setDescription(course.description);
    setImagePreview(course.coverImage);
  }, [course]);

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const res = await api.post<{ urls: string[] }>(
        "/v1/upload-file",
        {
          file,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setImageURL(res.data.urls[0]);
    },
  });

  // Handle image upload
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    processFile(file);
    uploadImage.mutate(file);
  };

  const processFile = (file: File) => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit");
      return;
    }

    // Check file type
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      alert("Only JPG, JPEG, and PNG files are allowed");
      return;
    }

    // Set file name for display
    setFileName(file.name);
    setImageFile(file);

    // Create a preview URL for the preview card
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        setImagePreview(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Validate form
    if (!name.trim()) {
      alert("Please enter a course name");
      return;
    }

    if (!imageFile) {
      alert("Please upload a cover image");
      return;
    }

    if (!description.trim()) {
      alert("Please enter course details");
      return;
    }

    try {
      setIsSubmitting(true);

      // Make sure we have a user ID
      if (!user.id) {
        throw new Error("User ID is required to create a course");
      }

      // Create course data object
      const courseData: CourseCreate = {
        name,
        description,
      };

      // Only add the coverImage if we have a file
      if (imageFile) {
        courseData.coverImage = imageFile;
      }

      // Create course with user ID using our mutation hook
      createCourseMutation(
        { courseData, userId: user.id },
        {
          onSuccess: (newCourse) => {
            // Redirect to teacher page
            router.push(`/teacher/${newCourse.id}`);
          },
          onError: (error) => {
            console.error("Error creating course:", error);
            alert("Failed to create course. Please try again.");
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        },
      );
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <div className={styles.contentContainer}>
        <div className={styles.formContainer}>
          <div className={styles.formGroup}>
            <h4 className="text-lg font-semibold mb-4">Settings</h4>
            <label htmlFor="courseName" className={styles.label}>
              Name
            </label>
            <input
              id="courseName"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Course name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cover Image</label>
            <div
              className={`${styles.imageUploadContainer} ${
                isDragging ? styles.dragging : ""
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleImageClick}
            >
              <div className={styles.uploadPlaceholder}>
                <div className={styles.imageUploadIcon}>↑</div>
                <div className={styles.imageUploadText}>
                  Choose a file or drag & drop it here
                </div>
                <div className={styles.imageFormatText}>
                  JPG,JPEG,PNG formats, up to 5mbs
                </div>
              </div>
              <input
                id="fileInput"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className={styles.hiddenInput}
                onChange={handleImageChange}
              />
            </div>
            {fileName && (
              <div className={styles.selectedFileName}>
                Selected file: {fileName}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="courseDetail" className={styles.label}>
              Detail
            </label>
            <textarea
              id="courseDetail"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue."
            />
          </div>

          <button
            className={styles.createButton}
            onClick={handleUpdate}
            disabled={
              (name === course?.name &&
                imageURL === course?.coverImage &&
                description === course?.description) ||
              uploadImage.isPending
            }
          >
            {updateCourse.isPending ? "Updating" : "Update"}
          </button>
          <h4 className="text-2xl font-medium mt-6">Danger Zone</h4>
          <DialogComp
            buttonName={"Delete course"}
            topic={"Delete this course?"}
            description={`Are you sure to delete ${course?.name} course,`}
            icon={<Trash size={20} />}
            onAcceptState={handleDelete}
          />
        </div>

        <div className={styles.previewContainer}>
          <label className={styles.previewTitle}>Previews</label>
          <div className={styles.previewCard}>
            <div className={styles.previewImage}>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Course preview"
                  className={styles.previewImageContent}
                />
              ) : (
                "No image uploaded"
              )}
            </div>
            <div className={styles.previewInfo}>
              <div className={styles.previewDetails}>
                <h3 className={styles.previewCourseTitle}>
                  {name || "Project Manager"}
                </h3>
                <p className={styles.previewInstructorName}>
                  {user.name || "Thirawat Kui"}
                </p>
              </div>
              <div className={styles.viewButton}>View</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
