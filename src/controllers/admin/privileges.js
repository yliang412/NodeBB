"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
const categories_1 = __importDefault(require("../../categories"));
const privileges_1 = __importDefault(require("../../privileges"));
// default export will cause test to fail. It might be related to different importing syntax
// used as part of the tests.
// eslint-disable-next-line import/prefer-default-export
function get(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const cid = req.params.cid ? parseInt(req.params.cid, 10) || 0 : 0;
        const isAdminPriv = req.params.cid === 'admin';
        // Note: Many parts of the privileges data are retrieved using hooks.
        // - e.g. users: plugins.hooks.fire('filter:privileges.global.list_human', labels.slice())
        // There is not really a way to get the type of `privilegesData` without walking through the
        // entire code base and see what things the hooks return.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let privilegesData;
        if (cid > 0) {
            privilegesData = yield privileges_1.default.categories.list(cid);
        }
        else if (cid === 0) {
            privilegesData = yield (isAdminPriv ? privileges_1.default.admin.list(req.uid) : privileges_1.default.global.list());
        }
        const categoriesData = [{
                cid: 0,
                name: '[[admin/manage/privileges:global]]',
                icon: 'fa-list',
            }, {
                cid: 'admin',
                name: '[[admin/manage/privileges:admin]]',
                icon: 'fa-lock',
            }];
        let selectedCategory;
        categoriesData.forEach((category) => {
            if (category) {
                category.selected = category.cid === (!isAdminPriv ? cid : 'admin');
                if (category.selected) {
                    selectedCategory = category;
                }
            }
        });
        if (!selectedCategory) {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            selectedCategory = (yield categories_1.default.getCategoryFields(cid, ['cid', 'name', 'icon', 'bgColor', 'color']));
        }
        const group = req.query.group ? req.query.group : '';
        res.render('admin/manage/privileges', {
            // Same problem with hook usage (line 27 in src/controllers/admin/privileges.ts)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            privileges: privilegesData,
            categories: categoriesData,
            selectedCategory,
            cid,
            group,
            isAdminPriv,
        });
    });
}
exports.get = get;
