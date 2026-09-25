CREATE INDEX "Survey_ownerId_updatedAt_idx" ON "Survey"("ownerId", "updatedAt");

CREATE INDEX "SurveyResponse_surveyId_status_ipHash_idx"
ON "SurveyResponse"("surveyId", "status", "ipHash");

CREATE INDEX "SurveyResponse_surveyId_status_deviceHash_idx"
ON "SurveyResponse"("surveyId", "status", "deviceHash");

CREATE INDEX "SurveyEvent_surveyId_type_idx" ON "SurveyEvent"("surveyId", "type");
