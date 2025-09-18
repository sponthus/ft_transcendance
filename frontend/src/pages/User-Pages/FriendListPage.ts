import { getAllFriends, AllFriends } from "../../api/user-service/menu/friendsList/friendRequest";
import { UserInfo } from "../../api/user-service/user-info/getUserInfo";
import { append, createAnchorElement, createDiv, createImage } from "../../Utils/elementMaker";
export async function displayFriendlist(parent: HTMLElement, userData: UserInfo , isOwnProfile: boolean) {
	parent.className = "flex flex-col items-center bg-orange-300  bg-opacity-50 w-full h-[60%] flex overflow-y-auto";
	if (isOwnProfile) {
		try {
			const req = await getAllFriends();
			if (req.ok) {
				const friendlist = req.friends;
				friendlist?.forEach(friend => {
					append(parent, [createFrienDiv(friend)]);
					console.log("create frien div body with ", friend.username, " ", friend.avatar);
				})
			}
		} catch(error) {
			alert(error);
		}
	}
	else {
	}
}

function createFrienDiv(friend: any): HTMLElement {
	const friendDiv: HTMLAnchorElement = createAnchorElement(`notification-${friend.slug}`, '', `/user/${friend.slug}`, 'group flex items-center justify between w-full h-24 space-x-4 shadow-xl w-[100%] h-[50%] group-hover:shadow-lg transition-all duration-200 transform');

	const userIcon: HTMLElement = createDiv(`user-notification-icon-${friend.slug}`, 'flex items-center justify-center bg-orange-300 group-hover:bg-orange-400 rounded-full relative shadow-xl  w-[10%] aspect-square group-hover:shadow-lg transition-all duration-200 transform');

	append(userIcon, [(createImage(`user-notification-${friend.slug}`, 'w-[90%] aspect-square rounded-full object-cover object-center',  `https://localhost:4443/uploads/${friend.avatar}`) as HTMLImageElement)]);

	const invitationTextDiv = createDiv(`invitation-text-${friend.slug}`, 'flex flex-col items-center text-4xl');
	invitationTextDiv.innerHTML = `<P class="text-emerald-600 group-hover:font-bold">${friend.username}</p>`;

	const btnDiv = createDiv(`btn-invitation-${friend.slug}`, 'fles items-center justify-between space-x-8') as HTMLElement;
	
	append(friendDiv, [userIcon, invitationTextDiv]);

	return friendDiv;	
}