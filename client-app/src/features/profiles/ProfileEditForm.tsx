import { ErrorMessage, Formik } from "formik";
import React from "react";
import { useStore } from "./../../app/stores/store";
import * as Yup from "yup";
import { Button, Form, Label } from "semantic-ui-react";
import MyTextInput from "./../../app/common/form/MyTextInput";
import MyTextArea from "../../app/common/form/MyTextArea";
import { observer } from "mobx-react-lite";

interface Props {
  setEditMode: (editMode: boolean) => void;
}

export default observer(function ProfileEditForm({ setEditMode }: Props) {
  const {
    profileStore: { profile, updateProfile },
  } = useStore();
  return (
    <Formik
      initialValues={{
        displayName: profile?.displayName,
        bio: profile?.bio,
        error: "",
      }}
      onSubmit={(values) => {
        console.log(profile);
        updateProfile(values).then(() => setEditMode(false));
      }}
      validationSchema={Yup.object({
        displayName: Yup.string().required("The display name is required"),
      })}
    >
      {({ handleSubmit, isSubmitting, isValid, dirty }) => (
        <Form className="ui form" onSubmit={handleSubmit}>
          <MyTextInput name="displayName" placeholder="Display Name" />
          <MyTextArea rows={3} name="bio" placeholder="Add your bio" />
          <Button
            floated="right"
            disabled={!isValid || !dirty}
            loading={isSubmitting}
            type="submit"
            positive
            content="Update profile"
          />
        </Form>
      )}
    </Formik>
  );
});
