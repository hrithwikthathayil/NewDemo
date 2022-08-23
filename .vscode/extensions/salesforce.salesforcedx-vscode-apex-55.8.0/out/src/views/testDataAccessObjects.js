"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestSummarizer {
    static summarize(summary) {
        let summString = '';
        summString = summString + 'Outcome: ' + summary.outcome + '\n';
        summString = summString + 'Tests Ran: ' + summary.testsRan + '\n';
        summString = summString + 'Passing: ' + summary.passing + '\n';
        summString = summString + 'Failing: ' + summary.failing + '\n';
        summString = summString + 'Skipped: ' + summary.skipped + '\n';
        summString = summString + 'Pass Rate: ' + summary.passRate + '\n';
        summString = summString + 'Fail Rate: ' + summary.failRate + '\n';
        summString =
            summString + 'Test Start Time: ' + summary.testStartTime + '\n';
        summString =
            summString + 'Test Execution Time: ' + summary.testExecutionTime + '\n';
        summString =
            summString + 'Test Total Time: ' + summary.testTotalTime + '\n';
        summString = summString + 'Command Time: ' + summary.commandTime + '\n';
        summString = summString + 'Hostname: ' + summary.hostname + '\n';
        summString = summString + 'Org Id: ' + summary.orgId + '\n';
        summString = summString + 'Username: ' + summary.username + '\n';
        summString = summString + 'Test Run Id: ' + summary.testRunId + '\n';
        summString = summString + 'User Id: ' + summary.userId;
        return summString;
    }
}
exports.TestSummarizer = TestSummarizer;
//# sourceMappingURL=testDataAccessObjects.js.map