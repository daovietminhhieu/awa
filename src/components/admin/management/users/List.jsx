import { useI18n } from "../../../../i18n";

export default function UserList() {
  const { t } = useI18n();

    return (
        <>
            <h1>{t('admin.users.title') || 'User List'}</h1>
        </>
    );
    
}