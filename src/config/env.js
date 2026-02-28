// Base URLs for each environment
export const environments = {
    local: {
        code: 'local',
        label: 'Local',
        baseUrl: 'http://localhost:3000', // Update as needed
    },
    prw: {
        code: 'prw',
        label: 'Preview',
        baseUrl: 'https://masaapp.prw.mindbricks.com',
    },
    stage: {
        code: 'stage',
        label: 'Staging',
        baseUrl: 'https://masaapp-stage.mindbricks.co',
    },
    prd: {
        code: 'prd',
        label: 'Production',
        baseUrl: 'https://masaapp.mindbricks.co',
    },
};

// When the application starts, ensure baseUrl is set to the production server URL by default.
const storedEnv = typeof window !== 'undefined' ? localStorage.getItem('masaEnv') : null;
export let currentEnv = storedEnv && environments[storedEnv] ? storedEnv : 'prd';

export const setEnv = (envCode) => {
    if (environments[envCode]) {
        currentEnv = envCode;
        if (typeof window !== 'undefined') {
            localStorage.setItem('masaEnv', envCode);
            window.location.reload(); // Reload to re-initialize service clients dynamically
        }
    }
};

export const getBaseUrl = () => environments[currentEnv]?.baseUrl || environments['prd'].baseUrl;

export const getServiceUrl = (serviceName) => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/${serviceName}-api`;
};

// Configuration object with getters for backwards compatibility and easy access
export const config = {
    get baseUrl() { return getBaseUrl(); },
    get authApi() { return getServiceUrl('auth'); },
    get masaCorporateApi() { return getServiceUrl('masaCorporate'); },
    get masaTaxonomyApi() { return getServiceUrl('masaTaxonomy'); },
    get optionsApi() { return getServiceUrl('options'); },
    get socialApi() { return getServiceUrl('social'); },
    get ticketApi() { return getServiceUrl('ticket'); },
    get masaSettingsApi() { return getServiceUrl('masasettings'); },
    get bucketApi() { return `${getBaseUrl()}/bucket`; }, // fallback for backwards compatibility
};
