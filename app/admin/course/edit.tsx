import { Edit, SimpleForm, TextInput, required, FileInput } from "react-admin";

export const CourseEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="id" validate={[required()]} label="Id" />
        <TextInput source="title" validate={[required()]} label="Title" />
        <TextInput source="imageSrc" validate={[required()]} label="Image" />
        {/* <FileInput source="imageSrc" validate={[required()]} label="File" /> */}
      </SimpleForm>
    </Edit>
  );
};
