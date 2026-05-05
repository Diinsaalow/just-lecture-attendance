import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import themeConfigSlice from './themeConfigSlice';
import authSlice from './slices/authSlice';
import { authApi } from './api/authApi';
import { userApi } from './api/userApi';
import { roleApi } from './api/roleApi';
import { mediaApi } from './api/mediaApi';
import { curriculumApi } from './api/curriculumApi';
import { levelApi } from './api/levelApi';
import { lectureClassApi } from './api/lectureClassApi';
import { academicYearApi } from './api/academicYearApi';
import { campusApi } from './api/campusApi';
import { facultyApi } from './api/facultyApi';
import { departmentApi } from './api/departmentApi';
import { semesterApi } from './api/semesterApi';
import { periodApi } from './api/periodApi';
import { courseApi } from './api/courseApi';
import { hallApi } from './api/hallApi';
import { subjectApi } from './api/subjectApi';
import { chapterApi } from './api/chapterApi';
import { lessonApi } from './api/lessonApi';
import { bookApi } from './api/bookApi';
import { nationalExaminationApi } from './api/nationalExaminationApi';
import { plansApi } from './api/plansApi';
import { orderApi } from './api/orderApi';
import { enrollmentApi } from './api/enrollmentApi';
import { paymentApi } from './api/paymentApi';
import { paymentMethodApi } from './api/paymentMethodApi';
import { smsProviderApi } from './api/smsProviderApi';
import { studentApi } from './api/studentApi';
import { lecturerApi } from './api/lecturerApi';
import { mobileApi } from './api/mobileApi';
import { quizApi } from './api/quizApi';
import { reviewApi } from './api/reviewApi';
import { dashboardApi } from './api/dashboardApi';
import { globalSearchApi } from './api/globalSearchApi';
import { reportApi } from './api/reportApi';
import { locationApi } from './api/locationApi';
import { campaignApi } from './api/campaignApi';
import { recipientApi } from './api/recipientApi';
import { recipientGroupApi } from './api/recipientGroupApi';
import { smsMessageApi } from './api/smsMessageApi';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authSlice,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [roleApi.reducerPath]: roleApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [curriculumApi.reducerPath]: curriculumApi.reducer,
    [levelApi.reducerPath]: levelApi.reducer,
    [lectureClassApi.reducerPath]: lectureClassApi.reducer,
    [academicYearApi.reducerPath]: academicYearApi.reducer,
    [campusApi.reducerPath]: campusApi.reducer,
    [facultyApi.reducerPath]: facultyApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [semesterApi.reducerPath]: semesterApi.reducer,
    [periodApi.reducerPath]: periodApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [hallApi.reducerPath]: hallApi.reducer,
    [subjectApi.reducerPath]: subjectApi.reducer,
    [chapterApi.reducerPath]: chapterApi.reducer,
    [lessonApi.reducerPath]: lessonApi.reducer,
    [bookApi.reducerPath]: bookApi.reducer,
    [nationalExaminationApi.reducerPath]: nationalExaminationApi.reducer,
    [plansApi.reducerPath]: plansApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [enrollmentApi.reducerPath]: enrollmentApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [paymentMethodApi.reducerPath]: paymentMethodApi.reducer,
    [smsProviderApi.reducerPath]: smsProviderApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [lecturerApi.reducerPath]: lecturerApi.reducer,
    [mobileApi.reducerPath]: mobileApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [globalSearchApi.reducerPath]: globalSearchApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
    [campaignApi.reducerPath]: campaignApi.reducer,
    [recipientApi.reducerPath]: recipientApi.reducer,
    [recipientGroupApi.reducerPath]: recipientGroupApi.reducer,
    [smsMessageApi.reducerPath]: smsMessageApi.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST',
                    'enrollmentApi/executeMutation/fulfilled',
                    'studentApi/executeMutation/fulfilled',
                    'students/executeMutation/fulfilled',
                    'orderApi/executeMutation/fulfilled',
                    'paymentApi/executeMutation/fulfilled',
                ],
                ignoredPaths: ['enrollmentApi.mutations', 'studentApi.mutations', 'students.mutations', 'orderApi.mutations', 'paymentApi.mutations'],
            },
        }).concat(
            authApi.middleware,
            userApi.middleware,
            roleApi.middleware,
            mediaApi.middleware,
            curriculumApi.middleware,
            levelApi.middleware,
            lectureClassApi.middleware,
            academicYearApi.middleware,
            campusApi.middleware,
            facultyApi.middleware,
            departmentApi.middleware,
            semesterApi.middleware,
            periodApi.middleware,
            courseApi.middleware,
            hallApi.middleware,
            subjectApi.middleware,
            chapterApi.middleware,
            lessonApi.middleware,
            bookApi.middleware,
            nationalExaminationApi.middleware,
            plansApi.middleware,
            orderApi.middleware,
            enrollmentApi.middleware,
            paymentApi.middleware,
            paymentMethodApi.middleware,
            smsProviderApi.middleware,
            studentApi.middleware,
            lecturerApi.middleware,
            mobileApi.middleware,
            quizApi.middleware,
            reviewApi.middleware,
            dashboardApi.middleware,
            globalSearchApi.middleware,
            reportApi.middleware,
            locationApi.middleware,
            campaignApi.middleware,
            recipientApi.middleware,
            recipientGroupApi.middleware,
            smsMessageApi.middleware,
        ),
    devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type IRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
