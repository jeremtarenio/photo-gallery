import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ApiService } from "./api.service";

class ApiResponse {
  constructor(public success: boolean, public url: string) {}
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "photo-sharing";
  selectedFile: { src: string; file: File };
  photos: { id: number; url: string; caption: string; dateTime: string }[] = [];
  groupedPhotos = [];
  activeImgIndex = 0;

  // upload modal
  fileName = "";
  errorMsg;

  photosFetched = false; // prevent variables from being undefined

  // UI state variables, e.g. modal
  uploadModalActive = false;
  galleryModalActive = false;
  isUploading = false;
  aFileIsSelected = false;
  uploadSuccess = false;
  uploadFailed = false;
  editCaptionModalActive = false;
  captionUpdating = false;
  deletePhotoModalActive = false;
  isDeleting = false;

  validImageTypes = ["image/gif", "image/jpeg", "image/png"];

  formTempHidden = false; // hides the upload form after upload

  constructor(private apiService: ApiService) {}

  @ViewChild("photoInput", { static: false })
  photoInput: ElementRef;

  ngOnInit(): void {
    this.fetchPhotos(false);
  }

  fetchPhotos(newUpload: boolean) { // fetches list of photos from backend
    this.apiService.getPhotos().subscribe((res) => {
      this.photos = res.photos;
      this.groupedPhotos = this.groupByDate(this.photos);
      this.photosFetched = true;

      if (newUpload) {
        this.uploadSuccess = false;
        this.activeImgIndex = this.photos.length - 1;
        this.galleryModalActive = true;
      }
    });
  }

  onClickImage(id) {  // sets the image index
    const photo = this.photos.find((el) => {
      return el.id === id;
    });

    const index = this.photos.indexOf(photo);

    this.activeImgIndex = index;
    this.galleryModalActive = true;
  }

  onClickPrev() { // gallery nav buttons
    if (this.activeImgIndex > 0) {
      this.activeImgIndex--;
    }
  }

  onClickNext() {
    if (this.activeImgIndex < this.photos.length - 1) {
      this.activeImgIndex++;
    }
  }

  onOpenUploadModal() {
    this.uploadModalActive = true;
  }

  onCloseUploadModal() {
    this.uploadModalActive = false;
  }

  onCloseGalleryModal() {
    this.galleryModalActive = false;
  }

  onSelectFile(photoInput) { // validating file input
    if (photoInput.files[0].size > 2000000) {
      this.uploadFailed = true;
      this.errorMsg = "Maximum file size is 2MB";
      this.aFileIsSelected = false;
    } else if (!this.validImageTypes.includes(photoInput.files[0].type)) {
      this.uploadFailed = true;
      this.errorMsg = "Invalid file type. Must be JPG/PNG/GIF";
      this.aFileIsSelected = false;
    } else {
      this.uploadFailed = false;
      this.aFileIsSelected = true;
      this.fileName = photoInput.files[0].name;
    }
  }

  onUpload(photoInput: any, caption: string) {
    if (this.aFileIsSelected) {
      this.isUploading = true;
      const file: File = photoInput.files[0];
      const reader = new FileReader();

      reader.addEventListener("load", (event: any) => {
        this.selectedFile = { src: event.target.result, file };

        this.apiService.uploadPhoto(this.selectedFile.file).subscribe( // upload to AWS s3
          (uploadRes: ApiResponse) => { // if success, then proceed to db create photo api
            this.apiService
              .createPhoto({ url: uploadRes.url, caption })
              .subscribe(
                (createRes: ApiResponse) => {
                  this.formTempHidden = true;
                  this.uploadSuccess = true;

                  this.uploadFailed = false;
                  this.isUploading = false;
                  this.aFileIsSelected = false;

                  this.photoInput.nativeElement.value = "";

                  setTimeout(() => {
                    this.formTempHidden = false;
                    this.uploadModalActive = false;
                    this.fetchPhotos(true);
                  }, 500);
                },
                (err) => { // error handling
                  this.isUploading = false;
                  this.aFileIsSelected = false;

                  this.uploadFailed = true;
                  this.photoInput.nativeElement.value = "";

                  this.errorMsg = err.error.error;
                }
              );
          },
          (err) => { // error handling
            this.isUploading = false;
            this.uploadFailed = true;
            this.errorMsg = err.error.error;
          }
        );
      });

      reader.readAsDataURL(file);
    } else {
      this.uploadFailed = true;
      this.errorMsg = "Please select a file.";
    }
  }

  onSubmitEditCaption(id, value) { // edit caption functionality
    this.captionUpdating = true;
    this.apiService.updateCaption(id, value).subscribe(res => { // update caption api
      this.captionUpdating = false;
      this.editCaptionModalActive = false;
      this.fetchPhotos(false);
    }, err => {
      console.log(err);
    });
  }

  onEditCaption() {
    this.editCaptionModalActive = true;
  }

  onCloseEditCaptionModal() {
    this.editCaptionModalActive = false;
  }

  onOpenDeleteModal() {
    this.deletePhotoModalActive = true;
  }

  onCloseDeleteModal() {
    this.deletePhotoModalActive = false;
  }

  onDeletePhoto(id: number) { // delete photo functionality
    this.isDeleting = true;
    this.apiService.deletePhoto(id).subscribe(res => { // delete api
      const photo = this.photos.find(el => {
        return el.id === id;
      });

      let index = this.photos.indexOf(photo);

      if (index === this.photos.length - 1) { // if last photo is being deleted
        index = this.photos.length - 2;
      }

      this.activeImgIndex = index;
      this.deletePhotoModalActive = false;
      this.isDeleting = false;
      this.fetchPhotos(false);
    }, err => {
      console.log(err);
    });
  }

  groupByDate(arr) { // helper, groups an array by date (for the photo grouping)
    const groups = arr.reduce((groups, photo) => {
      const date = this.toISOLocal(new Date(photo.date_time)).split("T")[0];

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(photo);
      return groups;
    }, {});

    const groupArrays = Object.keys(groups).map((date) => {
      return {
        date,
        photos: groups[date],
      };
    });

    return groupArrays;
  }

  toISOLocal(date) {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const msLocal =  date.getTime() - offsetMs;
    const dateLocal = new Date(msLocal);
    const iso = dateLocal.toISOString();
    const isoLocal = iso.slice(0, 19);
    return isoLocal;
  }

}
