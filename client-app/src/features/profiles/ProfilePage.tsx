import React, { useEffect } from "react";
import { Grid } from "semantic-ui-react";
import ProfileContent from "./ProfileContent";
import ProfileHeader from "./ProfileHeader";
import { useParams } from "react-router";
import { useStore } from "./../../app/stores/store";
import { observer } from "mobx-react-lite";
import LoadingComponent from "../../app/layout/LoadingComponent";

export default observer(function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { profileStore } = useStore();
  const { profile, loadingProfile, loadProfile } = profileStore;

  useEffect(() => {
    loadProfile(username);
  }, [loadProfile, username]);

  if (loadingProfile) return <LoadingComponent content="Loading profile..." />;

  return (
    <Grid>
      <Grid.Column>
        {profile && (
          <>
            <ProfileHeader profile={profile} />
            <ProfileContent profile={profile} />
          </>
        )}
      </Grid.Column>
    </Grid>
  );
});
