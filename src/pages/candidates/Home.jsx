import { useI18n } from '../../i18n';

export default function Home() {
    const { t } = useI18n();

    return (
        <h1>{t('pages.candidates.home_title') || 'Candidates Homepage'}</h1>
    );
}