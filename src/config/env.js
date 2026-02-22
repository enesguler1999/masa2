export const environments = {
    local: {
        baseUrl: '',
        authApi: '',
        bucketApi: '',
    },
    prw: {
        baseUrl: 'https://q3xp3masaapp1.prw.mindbricks.com',
        authApi: 'https://q3xp3masaapp1.prw.mindbricks.com/auth-api',
        bucketApi: 'https://bucket.prw.mindbricks.com/',
    },
    beta: {
        baseUrl: '',
        authApi: '',
        bucketApi: '',
    },
    stage: {
        baseUrl: 'https://q3xp3masaapp1-stage.mindbricks.co',
        authApi: 'https://q3xp3masaapp1-stage.mindbricks.co/auth-api',
        bucketApi: 'https://q3xp3masaapp1-stage.mindbricks.co/bucket',
    },
    prd: {
        baseUrl: 'https://q3xp3masaapp1.mindbricks.co',
        authApi: 'https://q3xp3masaapp1.mindbricks.co/auth-api',
        bucketApi: 'https://q3xp3masaapp1.mindbricks.co/bucket',
    },
};

export const currentEnv = 'prw'; // Default as prw without frontend selector

export const config = environments[currentEnv];
