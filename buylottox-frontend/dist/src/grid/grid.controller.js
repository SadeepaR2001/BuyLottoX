"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../modules/auth/jwt-auth.guard");
const buy_subtickets_dto_1 = require("./dto/buy-subtickets.dto");
const grid_service_1 = require("./grid.service");
let GridController = class GridController {
    constructor(gridService) {
        this.gridService = gridService;
    }
    getActiveGrid() {
        return this.gridService.getActiveGrid();
    }
    getGridNumbers(gridId) {
        return this.gridService.getGridNumbers(gridId);
    }
    getSubTickets(gridId, number) {
        return this.gridService.getSubTickets(gridId, Number(number));
    }
    buySubTickets(gridId, req, body) {
        return this.gridService.buySubTickets(gridId, req.user.sub, body);
    }
};
exports.GridController = GridController;
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GridController.prototype, "getActiveGrid", null);
__decorate([
    (0, common_1.Get)(':gridId/numbers'),
    __param(0, (0, common_1.Param)('gridId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GridController.prototype, "getGridNumbers", null);
__decorate([
    (0, common_1.Get)(':gridId/numbers/:number/subtickets'),
    __param(0, (0, common_1.Param)('gridId')),
    __param(1, (0, common_1.Param)('number')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GridController.prototype, "getSubTickets", null);
__decorate([
    (0, common_1.Post)(':gridId/buy'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('gridId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, buy_subtickets_dto_1.BuySubTicketsDto]),
    __metadata("design:returntype", void 0)
], GridController.prototype, "buySubTickets", null);
exports.GridController = GridController = __decorate([
    (0, common_1.Controller)('grid'),
    __metadata("design:paramtypes", [grid_service_1.GridService])
], GridController);
//# sourceMappingURL=grid.controller.js.map