import { Photo, Profile, UserActivity } from "../models/profile";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../api/agent";
import { store } from "./store";
import { format } from "date-fns";

export default class ProfileStore {
  profile: Profile | null = null;
  loadingProfile: boolean = false;
  uploading: boolean = false;
  loading: boolean = false;
  followings: Profile[] = [];
  loadingFollowings = false;
  activeTab: number = 0;
  userActivities: UserActivity[] = [];
  loadingActivities = false;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.activeTab,
      (activeTab) => {
        if (activeTab === 3 || activeTab === 4) {
          const predicate = activeTab === 3 ? "followers" : "following";
          this.loadFollowings(predicate);
        } else {
          this.followings = [];
        }
      }
    );
  }

  setActiveTab = (activeTab: any) => {
    this.activeTab = activeTab;
  };

  get isCurrentUser() {
    if (store.userStore.user && this.profile) {
      return store.userStore.user.userName === this.profile.username;
    }

    return false;
  }

  loadProfile = async (username: string) => {
    this.loadingProfile = true;
    try {
      const profile = await agent.Profiles.get(username);
      runInAction(() => {
        this.profile = profile;
        this.loadingProfile = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loadingProfile = false;
      });
    }
  };

  updateProfile = async (profile: Partial<Profile>) => {
    this.loading = true;
    try {
      await agent.Profiles.update(profile);
      runInAction(() => {
        if (this.profile) this.profile = { ...this.profile, ...profile };
        store.userStore.setDisplayName(profile.displayName!);
        this.loading = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  uploadPhoto = async (file: Blob) => {
    this.uploading = true;
    try {
      var response = await agent.Profiles.uploadPhoto(file);
      var photo = response.data;
      runInAction(() => {
        if (this.profile) {
          this.profile.photos?.push(photo);
          if (photo.isMain && store.userStore.user) {
            store.userStore.setImage(photo.url);
            this.profile.image = photo.url;
          }
        }
        this.uploading = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => (this.uploading = false));
    }
  };

  setMainPhoto = async (photo: Photo) => {
    this.loading = true;
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      store.userStore.setImage(photo.url);
      runInAction(() => {
        if (this.profile && this.profile.photos) {
          this.profile.photos.find((p) => p.isMain)!.isMain = false;
          this.profile.photos.find((p) => p.id === photo.id)!.isMain = true;
          this.profile.image = photo.url;
          this.loading = false;
        }
      });
    } catch (error) {
      console.log(error);
      runInAction(() => (this.loading = false));
    }
  };

  deletePhoto = async (id: string) => {
    try {
      await agent.Profiles.deletePhoto(id);
      runInAction(() => {
        if (this.profile && this.profile.photos) {
          this.profile.photos = this.profile?.photos.filter((p) => p.id !== id);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  updateFollowing = async (username: string, following: boolean) => {
    this.loading = true;
    try {
      await agent.Profiles.updateFollowing(username);
      store.activityStore.updateAttendeeFollowing(username);
      runInAction(() => {
        if (
          this.profile &&
          this.profile.username !== store.userStore.user?.userName &&
          this.profile.username == username
        ) {
          following
            ? this.profile.followersCount++
            : this.profile.followersCount--;
          this.profile.following = !this.profile.following;
        }
        if (
          this.profile &&
          this.profile.username === store.userStore.user?.userName
        ) {
          following
            ? this.profile.followingsCount++
            : this.profile.followingsCount--;
        }
        this.followings.forEach((profile) => {
          if (profile.username === username) {
            profile.following
              ? profile.followersCount--
              : profile.followersCount++;
            profile.following = !profile.following;
          }
        });
        this.loading = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  loadFollowings = async (predicate: string) => {
    this.loadingFollowings = true;
    try {
      const followings = await agent.Profiles.listFollowings(
        this.profile!.username,
        predicate
      );
      runInAction(() => {
        this.followings = followings;
        this.loadingFollowings = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.loadingFollowings = false;
      });
    }
  };

  loadActivities = async (predicate: string) => {
    this.loadingActivities = true;
    try {
      var activities = await agent.Profiles.listUserActivities(
        this.profile!.username,
        predicate
      );
      runInAction(() => {
        this.userActivities = activities;
        this.loadingActivities = false;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => (this.loadingActivities = false));
    }
  };
}
