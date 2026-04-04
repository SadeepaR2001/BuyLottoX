"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const admin_controller_1 = require("./admin.controller");
(0, node_test_1.describe)('AdminController', () => {
    let controller;
    (0, node_test_1.beforeEach)(async () => {
        const module = await Test.createTestingModule({
            controllers: [admin_controller_1.AdminController],
        }).compile();
        controller = module.get(admin_controller_1.AdminController);
    });
    (0, node_test_1.it)('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=admin.controller.spec.js.map