import { useI18n } from '../../i18n';

export default function JobsView() {
    const { t } = useI18n();

    return (
        <h1>{t('pages.candidates.jobsview_title') || 'Jobs'}</h1>
    );
}