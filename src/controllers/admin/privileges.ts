import { Request, Response } from 'express';

import categories from '../../categories';
import privileges from '../../privileges';

interface CategoryData {
    cid: number | string,
    name: string,
    icon: string,
    selected?: boolean,
    bgColor?: string,
    color?: string,
}

// default export will cause test to fail. It might be related to different importing syntax
// used as part of the tests.
// eslint-disable-next-line import/prefer-default-export
export async function get(req: Request & { uid: number }, res: Response): Promise<void> {
    const cid = req.params.cid ? parseInt(req.params.cid, 10) || 0 : 0;
    const isAdminPriv = req.params.cid === 'admin';

    // Note: Many parts of the privileges data are retrieved using hooks.
    // - e.g. users: plugins.hooks.fire('filter:privileges.global.list_human', labels.slice())
    // There is not really a way to get the type of `privilegesData` without walking through the
    // entire code base and see what things the hooks return.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let privilegesData;
    if (cid > 0) {
        privilegesData = await privileges.categories.list(cid);
    } else if (cid === 0) {
        privilegesData = await (isAdminPriv ? privileges.admin.list(req.uid) : privileges.global.list());
    }

    const categoriesData: Array<CategoryData> = [{
        cid: 0,
        name: '[[admin/manage/privileges:global]]',
        icon: 'fa-list',
    }, {
        cid: 'admin',
        name: '[[admin/manage/privileges:admin]]',
        icon: 'fa-lock',
    }];

    let selectedCategory: CategoryData;
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
        selectedCategory = await categories.getCategoryFields(cid, ['cid', 'name', 'icon', 'bgColor', 'color']) as CategoryData;
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
}
